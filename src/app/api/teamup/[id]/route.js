import { TeamUp } from "@/models/TeamUp";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { requireAuth } from "@/utils/server/auth";
import { parseForm } from "@/utils/server/parseForm";

export const PATCH = asyncHandler(async (req, context) => {
  const user = await requireAuth();
  const { id } = context.params;
  const { fields } = await parseForm(req);

  const status = fields.status?.toString();

  if (!["accepted", "rejected"].includes(status)) {
    throw new ApiResponse(400, null, "Invalid status value");
  }

  const request = await TeamUp.findById(id);

  console.log("request:", request)

  if (!request) {
    throw new ApiResponse(404, null, "Team-up request not found");
  }

  // Only receiver can update status
  if (request.to.toString() !== user._id.toString()) {
    throw new ApiResponse(403, null, "Not authorized to update this request");
  }

  request.status = status;
  await request.save();

  return Response.json(
    new ApiResponse(200, request, "Team-up request updated")
  );
});

export const DELETE = asyncHandler(async (_, context) => {
  const user = await requireAuth();
  const { id } = context.params;

  const request = await TeamUp.findById(id);

  if (!request) {
    throw new ApiResponse(404, null, "Team-up request not found");
  }

  // Only sender or receiver can delete
  if (
    request.from.toString() !== user._id.toString() &&
    request.to.toString() !== user._id.toString()
  ) {
    throw new ApiResponse(403, null, "Not authorized to delete this request");
  }

  await request.deleteOne();

  return Response.json(
    new ApiResponse(200, null, "Team-up request deleted successfully")
  );
});
