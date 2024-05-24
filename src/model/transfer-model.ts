import { GroupTransfer, Transaction, User } from "@prisma/client";

export type CreateTransactionRequest = {
  instructionType: string;
  transferDate?: string;
  transferTime?: string;
  transactions: {
    amount: string;
    destinationAccount: string;
    destinationBankName: string;
    destinationAccountName: string;
  }[];
};

export type TransactionRequest = {
  amount: number;
  destinationAccount: string;
  destinationBankName: string;
  destinationAccountName: string;
  groupTransferId: string;
};

export type CreateTransactionResponse = {
  referenceNumber: string;
  totalTransfer: number;
  totalAmount: number;
  sourceAccountNumber: string;
  instructionType: string;
  transferType: string;
  status: string;
};

export interface CreateTransactionResponseWithMaker
  extends CreateTransactionResponse {
  makerName: string;
}

export function toTransactionResponse(
  groupTransfer: GroupTransfer,
  transactions: TransactionRequest[]
): CreateTransactionResponse {
  return {
    referenceNumber: groupTransfer.referenceNumber,
    totalTransfer: transactions.length,
    totalAmount: transactions.reduce(
      (acc, transaction) => acc + transaction.amount,
      0
    ),
    status: groupTransfer.status,
    sourceAccountNumber: groupTransfer.sourceAccount,
    instructionType: groupTransfer.instructionType,
    transferType: groupTransfer.transferType,
  };
}

export function toTransactionResponseWithMakerName(groupTransfers: any) {
  return groupTransfers.map((groupTransfer: any) => {
    const transactionResponse = toTransactionResponse(
      groupTransfer,
      groupTransfer.Transactions
    );

    return {
      ...transactionResponse,
      makerName: groupTransfer.makerUser.username,
    };
  });
}
