require("dotenv").config();

import nodemailer from "nodemailer";

import { prismaClient } from "../application/database";

export class OtpService {
  private static generateOtp(): number {
    const min = 100000;
    const max = 999999;

    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  static async sendOtp(email: string): Promise<{}> {
    const emailAddress = process.env.EMAIL_ADDRESS;
    const emailPassword = process.env.EMAIL_PASSWORD;

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: emailAddress,
        pass: emailPassword,
      },
    });

    const otp = this.generateOtp().toString();
    await transporter.sendMail({
      from: emailAddress,
      to: email,
      subject: "OTP",
      text: `Your OTP is: ${otp}`,
    });

    const existingOtp = await prismaClient.otp.findFirst({
      where: {
        email,
      },
    });

    if (!existingOtp) {
      await prismaClient.otp.create({
        data: {
          email,
          otp,
        },
      });
      return { otp };
    }

    await prismaClient.otp.update({
      where: { email },
      data: { otp },
    });

    return { otp };
  }

  static async isOtpValid(email: string, otp: string): Promise<{}> {
    const existingOtp = await prismaClient.otp.findFirst({
      where: { email },
    });

    if (existingOtp?.otp === otp) {
      return true;
    }

    return false;
  }
}
