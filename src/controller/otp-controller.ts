import { NextFunction, Request, Response } from "express";

import { CreateUserRequest, LoginRequest } from "../model/user-model";
import { OtpService } from "../service/otp-service";

export class OtpController {
  static async sendOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const email = req.params.email;
      const response = await OtpService.sendOtp(email);

      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }
}
