import { GroupTransfer, Transaction, User } from "@prisma/client";

export type CreateTransactionRequest = {
  intructionType: string;
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
  intructionType: string;
  transferType: string;
};

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
    sourceAccountNumber: groupTransfer.sourceAccount,
    intructionType: groupTransfer.instructionType,
    transferType: groupTransfer.transferType,
  };
}
