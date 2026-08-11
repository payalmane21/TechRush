import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import path from "path";
import fs from "fs";
import { pool } from "@workspace/db";
import router from "./routes";
import { logger } from "./lib/logger";

const PgSession = connectPgSimple(session);

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Dynamic CORS allowing localhost, LAN IPs, and mobile browser origins
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const sessionStore = process.env.DATABASE_URL
  ? new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    })
  : new session.MemoryStore();

app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET ?? "eventhub-dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.COOKIE_SECURE === "true",
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: "lax",
    },
  }),
);

app.use("/api", router);

const staticPath = fs.existsSync(path.resolve(import.meta.dirname, "../../eventhub/public"))
  ? path.resolve(import.meta.dirname, "../../eventhub/public")
  : fs.existsSync(path.resolve(import.meta.dirname, "../../eventhub/dist"))
  ? path.resolve(import.meta.dirname, "../../eventhub/dist")
  : path.resolve(import.meta.dirname, "../../eventhub/dist/public");

if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    const indexHtml = path.resolve(staticPath, "index.html");
    if (fs.existsSync(indexHtml)) {
      res.sendFile(indexHtml);
    } else {
      next();
    }
  });
}

export default app;
