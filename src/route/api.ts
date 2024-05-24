import express from "express";

import { UserController } from "../controller/user-controller";
import { authMiddleware } from "../middleware/auth-middleware";

export const apiRouter = express.Router();
apiRouter.use(authMiddleware);
apiRouter.post("/api/logout", UserController.logout);
