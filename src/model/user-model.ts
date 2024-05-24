import { User } from "@prisma/client";

export type UserResponse = {
  userId: string;
  username: string;
  role: string;
  phoneNumber: string;
  email: string;
};

export type CreateUserRequest = {
  corporateAccountNumber: string;
  corporateName: string;
  userId: string;
  username: string;
  role: string;
  phoneNumber: string;
  verificationCode: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type LoginRequest = {
  corporateAccountNumber: string;
  userId: string;
  password: string;
};

export function toUserResponse(user: User): UserResponse {
  return {
    userId: user.userId,
    role: user.role,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
  };
}
