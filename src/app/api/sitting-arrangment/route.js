import { SittingArrangment } from "@/models/SittingArrangment";
import { ApiError } from "@/utils/server/ApiError";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { requireAuth } from "@/utils/server/auth";
import { uploadOnCloudinary } from "@/utils/server/cloudinary";
import { parseForm } from "@/utils/server/parseForm";
import "@/models/Tournament";
import "@/models/Game";
import "@/models/User";

export const POST = asyncHandler(async (req) => {
  const user = await requireAuth();
  const { fields, files } = await parseForm(req);

  const tournamentId = fields.tournamentId?.toString();
  const gameId = fields.gameId?.toString();

  const imagePath = Array.isArray(files.image)
    ? files.image[0]?.filepath
    : files.image?.filepath;

  if (!tournamentId || !gameId || !imagePath) {
    throw new ApiError(400, "Missing required fields");
  }

  const imageUpload = imagePath
    ? await uploadOnCloudinary(imagePath, "sitting-arrangment")
    : null;

  const sittingCreate = await SittingArrangment.create({
    tournament: tournamentId,
    game: gameId,
    image: imageUpload?.secure_url,
    user: user._id,
  });

  return Response.json(
    new ApiResponse(
      200,
      sittingCreate,
      "Sitting Arrangment created successfully"
    )
  );
});

export const GET = asyncHandler(async () => {
  const user = await requireAuth();
  const sittingArrangments = await SittingArrangment.find({ user })
    .populate("game tournament user")
    .lean();
  return Response.json(
    new ApiResponse(
      200,
      sittingArrangments,
      "Sitting Arrangments fetched successfully"
    )
  );
});
