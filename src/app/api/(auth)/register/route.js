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

/**
 * Basic string sanitization (trims and escapes input)
 */
function sanitize(input) {
  if (typeof input !== "string") return "";
  return input.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const POST = asyncHandler(async (req) => {
  // ✅ Connect to DB
  try {
    await connectDB();
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    throw new ApiError(500, "Database connection failed", err);
  }

  // ✅ Parse and sanitize JSON body
  let body;
  try {
    body = await req.json();
  } catch (err) {
    throw new ApiError(400, "Invalid JSON body", err);
  }

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
  } = body;

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
    verificationToken,
  });

  await user.save();

  const verifyURL = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=${verificationToken}`;

  // ✅ Double-check user was created
  // const createdUser = await User.findById(user._id).select(
  //   "-refreshToken -accessToken -password"
  // );

  // if (!createdUser) {
  //   throw new ApiError(500, "User creation failed, try again.");
  // }

  // // ✅ Token generation
  // const accessToken = generateAccessToken(createdUser);
  // const refreshToken = generateRefreshToken(createdUser);

  // // ✅ Save refreshToken in DB only
  // try {
  //   await User.findByIdAndUpdate(
  //     user._id,
  //     { refreshToken },
  //     { validateBeforeSave: false }
  //   );

  //   // After generating tokens:
  //   // setAuthCookies(accessToken, refreshToken);
  // } catch (err) {
  //   throw new ApiError(500, "Failed to update refreshToken in db.", err);
  // }

  // const safeUser = await User.findById(user._id).select(
  //   "-refreshToken -password -accessToken"
  // );
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
    subject: "Verify your email address",
    html: `
      <h2>Welcome, ${firstname}!</h2>
      <p>Click below to verify your email:</p>
      <a href="${verifyURL}">${verifyURL}</a>
    `,
  });

  return NextResponse.json(
    new ApiResponse(201, null, "Verfication Email Sent Successfully!")
  );

  // return setAuthCookies(res, accessToken, refreshToken);
});
