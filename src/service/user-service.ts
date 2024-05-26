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
import { OtpService } from "./otp-service";
import { CustomError } from "../error/custom-error";

export class UserService {
  static async register(request: CreateUserRequest): Promise<{}> {
    const registerRequest = Validation.validate(
      UserValidation.REGISTER,
      request
    );
    const {
      corporateAccountNumber,
      corporateName,
      verificationCode,
      ...userRequest
    } = registerRequest;

    const isOtpValid = await OtpService.isOtpValid(
      registerRequest.email,
      verificationCode
    );
    if (!isOtpValid) {
      throw new CustomError(
        400,
        JSON.stringify([
          {
            code: "not_valid",
            path: ["verificationCode"],
            message: "Verification code is not valid",
          },
        ])
      );
    }

    const totalUserWithSameUserID = await prismaClient.user.count({
      where: {
        userId: registerRequest.userId,
      },
    });

    if (totalUserWithSameUserID != 0) {
      throw new CustomError(
        400,
        JSON.stringify([
          {
            code: "already_exist",
            path: ["userId"],
            message: "User ID is already exist",
          },
        ])
      );
    }

    let corporate = await prismaClient.corporate.findFirst({
      where: {
        corporateAccountNumber: registerRequest.corporateAccountNumber,
      },
    });

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
      loginTime: new Date(),
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
      throw new ResponseError(401, "User Not Found");
    }

    if (
      user.Corporate.corporateAccountNumber !== request.corporateAccountNumber
    ) {
      throw new ResponseError(401, "User Not Found");
    }

    const isPasswordValid = await bcrypt.compare(
      request.password,
      user.password
    );
    if (!isPasswordValid) {
      throw new ResponseError(401, "User Not Found");
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
