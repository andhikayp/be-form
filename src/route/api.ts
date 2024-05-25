import express from "express";

import { UserController } from "../controller/user-controller";
import { authMiddleware } from "../middleware/auth-middleware";
import { TransferController } from "../controller/transfer-controller";

export const apiRouter = express.Router();
apiRouter.use(authMiddleware);
apiRouter.post("/api/logout", UserController.logout);
apiRouter.post("/api/transactions", TransferController.createTransactions);
apiRouter.get(
  "/api/transactions-overview",
  TransferController.getTransactionOverview
);
apiRouter.get("/api/transactions", TransferController.getTransactionList);
apiRouter.get(
  "/api/transactions/:referenceNumber",
  TransferController.getTransaction
);
apiRouter.post(
  "/api/transactions-audit/:referenceNumber",
  TransferController.auditTransaction
);
