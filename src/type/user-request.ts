import { Corporate, User } from "@prisma/client";
import { Request } from "express";

export interface UserWithCorporate extends User {
  Corporate: Corporate;
}

export interface UserRequest extends Request {
  user?: UserWithCorporate;
}

export const UserRole = {
  MAKER: "MAKER",
  APPROVER: "APPROVER",
} as const;

export type UserRoleType = keyof typeof UserRole;
