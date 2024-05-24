import express from "express";

import { UserController } from "../controller/user-controller";
import { OtpController } from "../controller/otp-controller";

export const publicRouter = express.Router();
publicRouter.post("/api/register", UserController.register);
publicRouter.post("/api/login", UserController.login);
publicRouter.get("/api/otp/:email", OtpController.sendOtp);
