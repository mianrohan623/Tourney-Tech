import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { ApiError } from "@/utils/server/ApiError";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const POST = asyncHandler(async (req) => {
  await connectDB();
  const { email, otp, newPassword } = await req.json();

  if (!email || !otp || !newPassword)
    throw new ApiError(400, "Email, OTP, and new password are required");

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  // Check OTP validity
  if (user.otp !== Number(otp))
    throw new ApiError(400, "Invalid OTP");

  if (Date.now() > user.otpExpiry)
    throw new ApiError(400, "OTP expired");

  // Update password (hashing auto in model or here)
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);

  // Clear OTP fields
  user.otp = undefined;
  user.otpExpiry = undefined;

  await user.save();

  return Response.json(
    new ApiResponse(200, null, "Password reset successfully")
  );
});
