import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import eventsRouter from "./events";
import registrationsRouter from "./registrations";
import paymentsRouter from "./payments";
import checkinRouter from "./checkin";
import volunteersRouter from "./volunteers";
import tasksRouter from "./tasks";
import dashboardRouter from "./dashboard";
import notificationsRouter from "./notifications";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(eventsRouter);
router.use(registrationsRouter);
router.use(paymentsRouter);
router.use(checkinRouter);
router.use(volunteersRouter);
router.use(tasksRouter);
router.use(dashboardRouter);
router.use(notificationsRouter);
router.use(chatRouter);

export default router;
