import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";

import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import {
  CreateUserRequest,
  LoginRequest,
  toUserResponse,
  UserResponse,
} from "../model/user-model";
import { UserValidation } from "../validation/user-validation";
import { Validation } from "../validation/validation";
import { response } from "express";
import { toCorporateResponse } from "../model/corporate-model";
import { User } from "@prisma/client";

export class UserService {
  static async register(request: CreateUserRequest): Promise<{}> {
    const registerRequest = Validation.validate(
      UserValidation.REGISTER,
      request
    );

    const totalUserWithSameUserID = await prismaClient.user.count({
      where: {
        userId: registerRequest.userId,
      },
    });

    if (totalUserWithSameUserID != 0) {
      throw new ResponseError(400, "User ID is already exists");
    }

    let corporate = await prismaClient.corporate.findFirst({
      where: {
        corporateAccountNumber: registerRequest.corporateAccountNumber,
      },
    });

    const { corporateAccountNumber, corporateName, ...userRequest } =
      registerRequest;
    if (!corporate) {
      corporate = await prismaClient.corporate.create({
        data: {
          corporateAccountNumber,
          corporateName,
        },
      });
    }

    userRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const user = await prismaClient.user.create({
      data: { ...userRequest, corporateId: corporate.id },
    });

    return UserService.response(user, corporate);
  }

  private static async response(
    user: {
      userId: string;
      username: string;
      corporateId: number;
      role: string;
      email: string;
      token: string | null;
      phoneNumber: string;
      password: string;
      verificationCode: string | null;
      createdAt: Date;
      updatedAt: Date;
    },
    corporate: {
      id: number;
      corporateAccountNumber: string;
      corporateName: string;
    }
  ) {
    const secretKey = "secretKey";
    const userResponse = toUserResponse(user);
    const corporateResponse = toCorporateResponse(corporate);
    const token = jwt.sign(
      { user: userResponse, corporate: corporateResponse },
      secretKey,
      {
        expiresIn: 86400,
      }
    );

    await prismaClient.user.update({
      where: {
        userId: user.userId,
      },
      data: { token },
    });

    return {
      token,
      user: userResponse,
      corporat: corporateResponse,
    };
  }

  static async login(request: LoginRequest): Promise<{}> {
    const user = await prismaClient.user.findUnique({
      where: {
        userId: request.userId,
      },
      include: {
        Corporate: true,
      },
    });

    if (!user) {
      throw new ResponseError(401, "Not found");
    }

    if (
      user.Corporate.corporateAccountNumber !== request.corporateAccountNumber
    ) {
      throw new ResponseError(401, "Not found");
    }

    const isPasswordValid = await bcrypt.compare(
      request.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new ResponseError(401, "Not found");
    }

    return UserService.response(user, user.Corporate);
  }

  static async logout(user: User): Promise<{}> {
    const result = await prismaClient.user.update({
      where: {
        userId: user.userId,
      },
      data: {
        token: null,
      },
    });

    return toUserResponse(result);
  }
}
