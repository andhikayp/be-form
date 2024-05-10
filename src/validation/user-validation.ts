import { z, ZodType } from "zod";

const startsWithLetterSchema = z.string().regex(/^[a-zA-Z]/, {
  message: "Username must start with a letter",
});

const validCharactersSchema = z.string().regex(/^[a-zA-Z0-9_]*$/, {
  message:
    "Username can only contain alphanumeric, characters, and underscores",
});

export class UserValidation {
  static readonly REGISTER: ZodType = z
    .object({
      username: z
        .string()
        .min(6, { message: "Username must be at least 6 characters long" })
        .max(30, { message: "Username must be at most 30 characters long" })
        .and(startsWithLetterSchema)
        .and(validCharactersSchema),
      email: z.string().min(1, { message: "Email has to be filled" }).email(),
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters long" })
        .max(100, { message: "Password must be at most 100 characters long" }),
      confirmPassword: z
        .string()
        .min(8, {
          message: "Confirm password must be at least 8 characters long",
        })
        .max(100, {
          message: "Confirm password must be at most 100 characters long",
        }),
      name: z
        .string()
        .min(1, { message: "Email has to be filled" })
        .max(100, { message: "Name must be at most 100 characters long" })
        .regex(/^[a-zA-Z]+$/, {
          message:
            "Name must contain only letters (no numbers or special characters)",
        }),
      phoneNumber: z
        .string()
        .min(13, {
          message: "Phone number must be at least 13 characters long",
        })
        .max(15, { message: "Phone number must be at most 15 characters long" })
        .regex(/^\+62.+$/, {
          message:
            "Phone number must be a valid indonesian number starting with +62",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Password must match",
      path: ["confirmPassword"],
    });
}
