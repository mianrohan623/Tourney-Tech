import { User } from "@/models/User";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { parseForm } from "@/utils/server/parseForm";

import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAdmin } from "@/utils/server/roleGuards";

export const POST = asyncHandler(async (req) => {
  await requireAdmin();

  const { fields: body } = await parseForm(req);

  const {
    firstname,
    lastname,
    email,
    username,
    phone,
    gender,
    city,
    stateCode,
    dob,
    role,
    password,
  } = body;

  if (!password) throw new ApiResponse(500, null, "Password is Required");

  const user = await User.create({
    firstname,
    lastname,
    email,
    username,
    phone,
    gender,
    city,
    stateCode,
    dob,
    role,
    password,
  });

  return Response.json(new ApiResponse(201, user, "User created successfully"));
});
