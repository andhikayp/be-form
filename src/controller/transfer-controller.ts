import { NextFunction, Request, Response } from "express";

import { CreateUserRequest, LoginRequest } from "../model/user-model";
import { OtpService } from "../service/otp-service";
import { TransferService } from "../service/transfer-service";
import {
  AuditRequest,
  CreateTransactionRequest,
} from "../model/transfer-model";
import { UserRequest } from "../type/user-request";

export class TransferController {
  static async createTransactions(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const request: CreateTransactionRequest =
        req.body as CreateTransactionRequest;
      const response = await TransferService.createTransactions(
        request,
        req.user!
      );

      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionOverview(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await TransferService.getTransactionOverview(req.user!);

      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransactionList(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const response = await TransferService.getTransactionList(req.user!);

      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTransaction(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { referenceNumber } = req.params as { referenceNumber: string };
      const response = await TransferService.getTransactionBy(
        req.user!,
        referenceNumber
      );

      res.status(200).json({
        data: response,
      });
    } catch (error) {
      next(error);
    }
  }

  static async auditTransaction(
    req: UserRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const request: AuditRequest = req.body as AuditRequest;
      const { referenceNumber } = req.params as { referenceNumber: string };
      await TransferService.auditTransaction(
        req.user!,
        referenceNumber,
        request
      );

      res.status(200).json({
        data: "OK",
      });
    } catch (error) {
      next(error);
    }
  }
}
