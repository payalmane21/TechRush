import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import fs from "fs";
import path from "path";
import app from "./app";
import { logger } from "./lib/logger";
import { setIo } from "./lib/socket";

// Load .env file automatically if present
try {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    if (typeof (process as any).loadEnvFile === "function") {
      (process as any).loadEnvFile(envPath);
    } else {
      const envContent = fs.readFileSync(envPath, "utf-8");
      for (const line of envContent.split("\n")) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const [key, ...vals] = trimmed.split("=");
          process.env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "");
        }
      }
    }
  }
} catch (e) {}

const rawPort = process.env["PORT"] ?? "5000";
const port = Number(rawPort);
const host = process.env["HOST"] ?? "0.0.0.0";

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = createServer(app);

const io = new SocketServer(httpServer, {
  cors: {
    origin: true,
    credentials: true,
  },
  path: "/api/socket.io",
});

setIo(io);

io.on("connection", (socket) => {
  logger.info({ socketId: socket.id }, "Socket connected");

  socket.on("join_event_room", (eventId: string) => {
    const room = `event:${eventId}`;
    socket.join(room);
    logger.info({ socketId: socket.id, room }, "Socket joined room");
  });

  socket.on("disconnect", () => {
    logger.info({ socketId: socket.id }, "Socket disconnected");
  });
});

httpServer.listen(port, host, (err?: Error) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ host, port }, "Server listening on all network interfaces");
});
