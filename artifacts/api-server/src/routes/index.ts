import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import eventsRouter from "./events";
import registrationsRouter from "./registrations";
import checkinRouter from "./checkin";
import volunteersRouter from "./volunteers";
import tasksRouter from "./tasks";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(eventsRouter);
router.use(registrationsRouter);
router.use(checkinRouter);
router.use(volunteersRouter);
router.use(tasksRouter);
router.use(dashboardRouter);

export default router;
