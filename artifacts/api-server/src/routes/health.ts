import { Router, type IRouter } from "express";

const router: IRouter = Router();

const getHealthStatus = () => ({
  status: "ok",
  service: "EventHub Production API Engine",
  timestamp: new Date().toISOString(),
  uptime: process.uptime(),
  memoryUsage: process.memoryUsage(),
  environment: process.env.NODE_ENV || "production",
  emailDemoMode: process.env.EMAIL_DEMO_MODE === "true",
});

router.get("/healthz", (_req, res) => {
  res.json(getHealthStatus());
});

router.get("/health", (_req, res) => {
  res.json(getHealthStatus());
});

export default router;
