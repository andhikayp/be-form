import { NextFunction, Response, Request } from "express";
import { ZodError, ZodIssue } from "zod";
import { ResponseError } from "../error/response-error";

type FormatIssueResponse = {
  path: (string | number)[];
  message: string;
  code: string;
};

const formatZodIssue = (issue: ZodIssue): FormatIssueResponse => {
  const { path, message, code } = issue;

  return {
    code,
    path,
    message,
  };
};

export const formatZodError = (error: ZodError): FormatIssueResponse[] => {
  const { issues } = error;

  const errors: FormatIssueResponse[] = [];
  issues.forEach((issue) => {
    const zodIssue = formatZodIssue(issue);
    errors.push(zodIssue);
  });

  return errors;
};

export const errorMiddleware = async (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (error instanceof ZodError) {
    const errors = formatZodError(error);

    return res.status(400).json({ errors });
  }
  if (error instanceof ResponseError) {
    return res.status(error.status).json({
      errors: error.message,
    });
  }
  res.status(500).json({
    errors: error.message,
  });
};
