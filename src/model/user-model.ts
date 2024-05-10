export type UserResponse = {
  username: string;
  email: string;
  name: string;
  phoneNumber: string;
};

export type CreateUserRequest = {
  username: string;
  email: string;
  name: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
};

export function toUserResponse(user: CreateUserRequest): UserResponse {
  return {
    name: user.name,
    username: user.username,
    email: user.email,
    phoneNumber: user.phoneNumber,
  };
}
