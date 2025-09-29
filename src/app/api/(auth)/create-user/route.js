import { User } from "@/models/User";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { parseForm } from "@/utils/server/parseForm";

const { asyncHandler } = require("@/utils/server/asyncHandler");
const { requireAdmin } = require("@/utils/server/roleGuards");

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
  } = body;

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
  });

  return Response.json(new ApiResponse(201, user, "User created successfully"));
});
