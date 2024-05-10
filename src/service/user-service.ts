import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";

import { ResponseError } from "../error/response-error";
import {
  CreateUserRequest,
  toUserResponse,
  UserResponse,
} from "../model/user-model";
import { UserValidation } from "../validation/user-validation";
import { Validation } from "../validation/validation";
import { response } from "express";

export class UserService {
  static async register(request: CreateUserRequest): Promise<UserResponse> {
    const registerRequest = Validation.validate(
      UserValidation.REGISTER,
      request
    );

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);
    registerRequest.confirmPassword = await bcrypt.hash(registerRequest.confirmPassword, 10);

    return toUserResponse(registerRequest);
  }
}
