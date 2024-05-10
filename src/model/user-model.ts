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

function formatPhoneNumber(phoneNumber: string): string {
  if (phoneNumber.startsWith('+62')) {
    return '0' + phoneNumber.substr(3);
  }
  return phoneNumber;
}

export function toUserResponse(user: CreateUserRequest): UserResponse {
  return {
    name: user.name,
    username: user.username,
    email: user.email,
    phoneNumber: formatPhoneNumber(user.phoneNumber),
  };
}
