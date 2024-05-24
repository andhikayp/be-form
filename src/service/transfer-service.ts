import { Transaction, User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

import { prismaClient } from "../application/database";
import {
  CreateTransactionRequest,
  toTransactionResponse,
  toTransactionResponseWithMakerName,
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

  private static async fetchGroupTransferBy(
    role: string,
    sourceAccount: string
  ) {
    if (role === UserRole.MAKER) {
      return prismaClient.groupTransfer.findMany({
        where: { sourceAccount },
        include: {
          Transactions: true,
          makerUser: { select: { username: true } },
        },
      });
    }

    return prismaClient.groupTransfer.findMany({
      where: { sourceAccount, status: TransactionStatus.WAITING },
      include: {
        Transactions: true,
        makerUser: { select: { username: true } },
      },
    });
  }

  static async getTransactionList(user: UserWithCorporate) {
    const sourceAccount = user.Corporate.corporateAccountNumber;
    const role = user.role;
    const groupTransfers = await this.fetchGroupTransferBy(role, sourceAccount);

    return toTransactionResponseWithMakerName(groupTransfers);
  }

  static async getTransactionBy(user: UserWithCorporate, referenceNumber: string) {
    const sourceAccount = user.Corporate.corporateAccountNumber;
    const groupTransfer = await prismaClient.groupTransfer.findFirst({
      where: { sourceAccount, referenceNumber },
      include: {
        Transactions: true,
      },
    });

    return toTransactionResponse(groupTransfer!, groupTransfer!.Transactions);
  }
}
