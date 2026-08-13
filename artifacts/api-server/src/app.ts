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

// Vercel Serverless Path Normalizer (Restores original URL if mangled to index.js)
app.use((req, _res, next) => {
  const forwarded =
    (req.headers["x-forwarded-url"] as string) ||
    (req.headers["x-now-route-matches"] as string) ||
    (req.headers["x-vercel-matched-path"] as string);

  if (req.url.includes("index.js") && forwarded && !forwarded.includes("index.js")) {
    const queryIndex = req.url.indexOf("?");
    const queryString = queryIndex !== -1 ? req.url.slice(queryIndex) : "";
    req.url = forwarded.includes("?") ? forwarded : `${forwarded}${queryString}`;
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

// Direct Health Check Endpoints
app.get(["/health", "/api/health", "/healthz", "/api/healthz"], (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "EventHub Production API Engine",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "production",
  });
});

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

// Ensure API requests never return HTML error pages
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.url.startsWith("/api")) {
    res.status(404).json({
      error: `API route not found: ${req.method} ${req.originalUrl || req.url}`,
    });
    return;
  }
  next();
});

// Centralized JSON Error Handler
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
  });
});

export default app;
