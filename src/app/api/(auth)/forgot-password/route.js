import crypto from "crypto";
import nodemailer from "nodemailer";
import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";

export const POST = asyncHandler(async (req) => {
  const { email } = await req.json();

  const user = await User.findOne({ email });
  if (!user) {
    return Response.json(new ApiResponse(404, null, "No user found with that email."));
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins
  await user.save();

  const resetURL = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Tournament App" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Password Reset Request",
    html: `
      <p>Click the link below to reset your password:</p>
      <a href="${resetURL}">${resetURL}</a>
    `,
  });

  return Response.json(
    new ApiResponse(200, null, "Password reset email sent successfully.")
  );
});
