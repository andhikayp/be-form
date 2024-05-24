import { Transaction, User } from "@prisma/client";
import { prismaClient } from "../application/database";
import {
  CreateTransactionRequest,
  toTransactionResponse,
  TransactionRequest,
} from "../model/transfer-model";
import { v4 as uuidv4 } from "uuid";
import { UserWithCorporate } from "../type/user-request";

export class TransferService {
  static async createTransactions(
    req: CreateTransactionRequest,
    user: UserWithCorporate
  ): Promise<{}> {
    const referenceNumber = uuidv4();
    const payload = {
      referenceNumber,
      sourceAccount: user.Corporate.corporateAccountNumber,
      makerUserId: user.userId,
      status: user.role === "APPROVER" ? "APPROVED" : "WAITING",
      instructionType: req.intructionType,
      transferType: "ONLINE",
      ...(req.intructionType === "STANDING_INSTRUCTION" && {
        transferDate: new Date(req.transferDate!),
        transferTime: req.transferTime,
      }),
    };

    const groupTransfer = await prismaClient.groupTransfer.create({
      data: payload,
    });

    const transactionsRequest: TransactionRequest[] = req.transactions.map(
      (transaction) => {
        return {
          ...transaction,
          amount: Number(transaction.amount),
          groupTransferId: referenceNumber,
        };
      }
    );

    const transactions = await prismaClient.transaction.createMany({
      data: transactionsRequest,
    });

    return toTransactionResponse(groupTransfer, transactionsRequest);
  }
}
