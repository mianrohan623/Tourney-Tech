// import { Registration } from "@/models/Registration";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
import "@/models/Game";
// import { User } from "@/models/User";
import { parseForm } from "@/utils/server/parseForm";
import { ApiError } from "@/utils/server/ApiError";
import { TeamUp } from "@/models/TeamUp";

export const POST = asyncHandler(async (req) => {
  const user = await requireAuth(req);
  const { fields } = await parseForm(req);

  const to = fields.to?.toString();
  const message = fields.message?.toString();

  if (!to) throw new ApiError(400, null, "Receiver user ID (to) is required");

  if (to.toString() === user._id.toString())
    throw new ApiError(400, null, "Cannot send team-up request to yourself");

  const request = await TeamUp.create({
    from: user._id,
    to,
    message,
  });

  return Response.json(
    new ApiResponse(201, request, "Team-up request sent successfully")
  );
});

/**
 * @desc Get all my team-up requests
 * @route GET /api/teamup
 */
export const GET = asyncHandler(async () => {
  const user = await requireAuth();

  const requests = await TeamUp.find({
    $or: [{ from: user._id }, { to: user._id }],
  })
    .populate("from", "name email")
    .populate("to", "name email");

  return Response.json(
    new ApiResponse(200, requests, "Fetched team-up requests")
  );
});
