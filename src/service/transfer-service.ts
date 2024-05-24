import { Transaction, User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

import { prismaClient } from "../application/database";
import {
  CreateTransactionRequest,
  toTransactionResponse,
  TransactionRequest,
} from "../model/transfer-model";
import { UserRole, UserWithCorporate } from "../type/user-request";
import {
  InstructionType,
  TransactionStatus,
  TransactionStatusType,
  TransferType,
} from "../type/transaction";

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
      status:
        user.role === UserRole.APPROVER
          ? TransactionStatus.APPROVED
          : TransactionStatus.WAITING,
      instructionType: req.instructionType,
      transferType: TransferType.ONLINE,
      ...(req.instructionType === InstructionType.STANDING_INSTRUCTION && {
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

  static async getTransactionOverview(user: UserWithCorporate) {
    const sourceAccount = user.Corporate.corporateAccountNumber;

    const groupTransfers = await prismaClient.groupTransfer.findMany({
      where: { sourceAccount },
    });

    const statusCounts: Record<TransactionStatusType, number> = {
      REJECTED: 0,
      APPROVED: 0,
      WAITING: 0,
    };

    groupTransfers.forEach(({ status }) => {
      statusCounts[status as TransactionStatusType]++;
    });

    return statusCounts;
  }
}
