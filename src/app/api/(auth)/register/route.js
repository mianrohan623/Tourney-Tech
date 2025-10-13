// src\app\api\auth\register\route.js

import { connectDB } from "@/lib/mongoose";
import { User } from "@/models/User";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { ApiError } from "@/utils/server/ApiError";
import { asyncHandler } from "@/utils/server/asyncHandler";
import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from "@/utils/server/tokens";
import { NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import sendEmail from "@/constants/EmailProvider";
import { parseForm } from "@/utils/server/parseForm";

/**
 * Basic string sanitization (trims and escapes input)
 */
function sanitize(input) {
  if (typeof input !== "string") return "";
  return input.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const POST = asyncHandler(async (req) => {
  // ✅ Connect to DB
  const {fields} = await parseForm(req);

  const otp = Math.floor(100000 + Math.random() * 900000);
  const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes validity

  const {
    firstname,
    lastname,
    email,
    username,
    password,
    city,
    stateCode,
    dob,
    phone,
    gender,
    avatar,
    club,
    subCity,
  } = fields;

  // ✅ Sanitize all values
  const clean = {
    firstname: sanitize(firstname),
    lastname: sanitize(lastname),
    email: sanitize(email),
    username: sanitize(username),
    password: sanitize(password),
    city: sanitize(city),
    stateCode: sanitize(stateCode),
    dob: sanitize(dob),
    phone: sanitize(phone),
    gender: sanitize(gender),
    avatar: sanitize(avatar),
    club: sanitize(club),
    subCity: sanitize(subCity),
  };

  // ✅ Required field validation
  const requiredFields = [
    "firstname",
    "lastname",
    "email",
    "username",
    "password",
    "city",
    "stateCode",
    "dob",
    "phone",
    "gender",
  ];
  const missing = requiredFields.filter((key) => !clean[key]);

  if (missing.length > 0) {
    throw new ApiError(400, `Missing required fields: ${missing.join(", ")}`);
  }

  // ✅ Check for existing user
  const existingUser = await User.findOne({
    $or: [{ email: clean.email }, { username: clean.username }],
  }).select("-refreshToken -password");

  if (existingUser) {
    throw new ApiError(409, "Email or username already in use");
  }

  const verificationToken = crypto.randomBytes(32).toString("hex");

  // ✅ Create user
  const user = new User({
    firstname: clean.firstname,
    lastname: clean.lastname,
    email: clean.email,
    username: clean.username.toLowerCase(),
    password: clean.password,
    city: clean.city,
    stateCode: clean.stateCode,
    dob: clean.dob,
    phone: clean.phone,
    gender: clean.gender,
    avatar: clean.avatar || undefined,
    club: clean.club,
    subCity: clean.subCity,
    otp,
    otpExpiry,
  });

  await user.save();

  const verifyURL = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=${verificationToken}`;

  const emailContent = {
    from: `"Tournament App" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Email Verification OTP",
    html: `
      <h2>Hello ${firstname}!</h2>
      <p>Your OTP for verification is:</p>
      <h1 style="letter-spacing:4px;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    `,
  };

  await sendEmail(emailContent);

  return NextResponse.json(
    new ApiResponse(201, null, "Verfication Email Sent Successfully!")
  );

  // return setAuthCookies(res, accessToken, refreshToken);
});
