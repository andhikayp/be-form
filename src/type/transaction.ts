export const TransactionStatus = {
  REJECTED: "REJECTED",
  APPROVED: "APPROVED",
  WAITING: "WAITING",
} as const;

export type TransactionStatusType = keyof typeof TransactionStatus;

export const TransferType = {
  ONLINE: "ONLINE",
  APPROVED: "APPROVED",
  WAITING: "WAITING",
} as const;

export type TransferTypeType = keyof typeof TransferType;

export const InstructionType = {
  IMMEDIATE: "IMMEDIATE",
  STANDING_INSTRUCTION: "STANDING_INSTRUCTION",
} as const;

export type InstructionTypeType = keyof typeof InstructionType;
