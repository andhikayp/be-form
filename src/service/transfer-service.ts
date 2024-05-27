import { Transaction, User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

import { prismaClient } from "../application/database";
import {
  AuditRequest,
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
import { ResponseError } from "../error/response-error";

export class TransferService {
  static async createTransactions(
    req: CreateTransactionRequest,
    user: UserWithCorporate
  ): Promise<{}> {
    const { role } = user;
    if (role === UserRole.APPROVER) {
      throw new ResponseError(403, "Forbidden");
    }
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
    sourceAccount: string,
    page: number,
    limit: number
  ) {
    const skip = (page - 1) * limit;
    let condition = {};
    if (role === UserRole.MAKER) {
      condition = {
        where: { sourceAccount },
      };
    }
    if (role === UserRole.APPROVER) {
      condition = {
        where: { sourceAccount, status: TransactionStatus.WAITING },
      };
    }

    const groupTransfers = await prismaClient.groupTransfer.findMany({
      ...condition,
      include: {
        Transactions: true,
        makerUser: { select: { username: true } },
      },
      skip,
      take: limit,
    });
    const totalGroupTransfers = await prismaClient.groupTransfer.count(
      condition
    );

    return { groupTransfers, totalGroupTransfers };
  }

  static async getTransactionList(
    user: UserWithCorporate,
    page: number,
    limit: number
  ) {
    const sourceAccount = user.Corporate.corporateAccountNumber;
    const role = user.role;
    const { groupTransfers, totalGroupTransfers } =
      await this.fetchGroupTransferBy(role, sourceAccount, page, limit);

    const mappedGroupTransfers =
      toTransactionResponseWithMakerName(groupTransfers);

    return {
      data: mappedGroupTransfers,
      totalPages: Math.ceil(totalGroupTransfers / limit),
      currentPage: page,
      count: totalGroupTransfers,
    };
  }

  static async getTransactionBy(
    user: UserWithCorporate,
    referenceNumber: string,
    page: number,
    limit: number
  ) {
    const sourceAccount = user.Corporate.corporateAccountNumber;

    const groupTransfer = await prismaClient.groupTransfer.findFirst({
      where: { sourceAccount, referenceNumber },
      include: {
        makerUser: { select: { username: true } },
      },
    });

    if (!groupTransfer) {
      throw new ResponseError(404, "Not Found");
    }

    const condition = {
      where: { groupTransferId: groupTransfer!.referenceNumber },
    };
    const skip = (page - 1) * limit;
    const Transactions = await prismaClient.transaction.findMany({
      ...condition,
      skip,
      take: limit,
    });
    const totalTransactions = await prismaClient.transaction.count(condition);
    const totalAmount = await prismaClient.transaction.aggregate({
      ...condition,
      _sum: {
        amount: true,
      },
    });

    const mappedGroupTransfer = toTransactionResponse(
      groupTransfer,
      Transactions,
      true
    );

    return {
      data: { ...mappedGroupTransfer, totalAmount: totalAmount._sum.amount },
      totalPages: Math.ceil(totalTransactions / limit),
      currentPage: page,
      count: totalTransactions,
    };
  }

  static async auditTransaction(
    user: UserWithCorporate,
    referenceNumber: string,
    req: AuditRequest
  ) {
    const { status } = req;
    const { role } = user;
    if (role !== UserRole.APPROVER) {
      throw new ResponseError(403, "Forbidden");
    }

    const groupTransfer = await prismaClient.groupTransfer.findFirst({
      where: { referenceNumber },
    });

    if (groupTransfer?.status !== TransactionStatus.WAITING) {
      throw new ResponseError(403, "Forbidden");
    }

    await prismaClient.groupTransfer.update({
      where: { referenceNumber },
      data: { status },
    });
  }
}
