import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import jwt from "jsonwebtoken";

import { prismaClient } from "../application/database";
import { ResponseError } from "../error/response-error";
import {
  CreateUserRequest,
  toUserResponse,
  UserResponse,
} from "../model/user-model";
import { UserValidation } from "../validation/user-validation";
import { Validation } from "../validation/validation";
import { response } from "express";
import { toCorporateResponse } from "../model/corporate-model";

export class UserService {
  static async register(request: CreateUserRequest): Promise<{}> {
    const registerRequest = Validation.validate(
      UserValidation.REGISTER,
      request
    );
    console.log(registerRequest, "registerRequest");

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

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const user = await prismaClient.user.create({
      data: { ...userRequest, corporateId: corporate.id },
    });

    const secretKey = "secretKey";
    const userResponse = toUserResponse(user);
    const corporateResponse = toCorporateResponse(corporate);
    const token = jwt.sign({ user: userResponse, corporate: corporateResponse }, secretKey, {
      expiresIn: 86400,
    });

    return {
      token,
      user: userResponse,
      corporat: corporateResponse,
    };
  }
}
