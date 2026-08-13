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

// Vercel Serverless Path Normalizer (Restores original requested URL when rewrites route to /api/index.js)
app.use((req, _res, next) => {
  const original =
    (req.headers["x-matched-path"] as string) ||
    (req.headers["x-forwarded-url"] as string) ||
    (req.headers["x-vercel-matched-path"] as string);

  if (original && (original.startsWith("/api") || original === "/api")) {
    const queryIndex = req.url.indexOf("?");
    const queryString = queryIndex !== -1 ? req.url.slice(queryIndex) : "";
    req.url = original.includes("?") ? original : `${original}${queryString}`;
  }
  next();
});

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
      errorLog: () => {},
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
app.use("/", router);

const possiblePaths = [
  path.resolve(process.cwd(), "public"),
  path.resolve(process.cwd(), "artifacts/eventhub/dist"),
  path.resolve(import.meta.dirname, "../../../public"),
  path.resolve(import.meta.dirname, "../../eventhub/dist"),
  path.resolve(import.meta.dirname, "../../eventhub/public"),
];

const staticPath =
  possiblePaths.find((p) => fs.existsSync(path.resolve(p, "index.html"))) ||
  possiblePaths.find((p) => fs.existsSync(p)) ||
  path.resolve(process.cwd(), "public");

if (fs.existsSync(staticPath)) {
  app.use(
    express.static(staticPath, {
      setHeaders(res, filePath) {
        if (filePath.endsWith(".html")) {
          res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
        }
      },
    }),
  );
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    const indexHtml = path.resolve(staticPath, "index.html");
    if (fs.existsSync(indexHtml)) {
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.sendFile(indexHtml);
    } else {
      next();
    }
  });
}

export default app;
