import { Registration, GameRegistrationSchema } from "@/models/Registration.js";
import { Tournament } from "@/models/Tournament.js";
// import { Team } from "@/models/Team.js";
import { ApiError } from "@/utils/server/ApiError";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";
import { parseForm } from "@/utils/server/parseForm";
import { requireAuth } from "@/utils/server/auth";
import mongoose from "mongoose";

export const POST = asyncHandler(async (req) => {
  const { fields } = await parseForm(req);
  const user = await requireAuth();


  const tournamentId = fields.tournamentId?.toString();
  const userId = user?._id;
  const gameIds = Array.isArray(fields.gameIds)
    ? fields.gameIds
    : fields.gameIds
      ? [fields.gameIds]
      : [];
//   const teamId = fields.teamId?.toString();
  const paymentMethod = fields.paymentMethod?.toString();
  const paymentDetails =
    typeof fields.paymentDetails === "string"
      ? JSON.parse(fields.paymentDetails)
      : fields.paymentDetails;

  if (!tournamentId || !userId) {
    throw new ApiError(400, "Tournament ID and User ID are required.");
  }

  if (!gameIds.length) {
    throw new ApiError(400, "At least one Game ID is required.");
  }

  if (
    !mongoose.isValidObjectId(tournamentId) ||
    !mongoose.isValidObjectId(userId)
  ) {
    throw new ApiError(400, "Invalid Tournament ID or User ID.");
  }

  const tournament = await Tournament.findById(tournamentId);
  if (!tournament) {
    throw new ApiError(404, "Tournament not found.");
  }

  const existingRegistration = await Registration.findOne({
    tournament: tournamentId,
    user: userId,
  });
  if (existingRegistration) {
    throw new ApiError(400, "User already registered for this tournament.");
  }

  const gameRegistrationDetails = {
    game: gameIds.map((gameId) => {
      if (!gameId || !mongoose.isValidObjectId(gameId)) {
        throw new ApiError(400, `Game ID ${gameId} is invalid.`);
      }
      return new mongoose.Types.ObjectId(gameId);
    }), 
    status: "pending",
    paid: false,
    paymentMethod: paymentMethod || "cash",
  };

  /*
  if (tournament.isTeamBased) {
    if (!teamId || !mongoose.isValidObjectId(teamId)) {
      throw new ApiError(400, "Team ID is required for team-based tournament.");
    }

    const team = await Team.findById(teamId);
    if (!team) {
      throw new ApiError(404, `Team not found for team ID ${teamId}.`);
    }

    gameRegistrationDetails.team = new mongoose.Types.ObjectId(teamId);
  }
  */

  if (paymentMethod === "online") {
    if (
      !paymentDetails ||
      !paymentDetails.bankId ||
      !paymentDetails.accountName ||
      !paymentDetails.transactionId ||
      !mongoose.isValidObjectId(paymentDetails.bankId)
    ) {
      throw new ApiError(
        400,
        "Bank ID, Account Name, and Transaction ID are required for online payments, and Bank ID must be valid."
      );
    }
    gameRegistrationDetails.paymentDetails = {
      bankId: new mongoose.Types.ObjectId(paymentDetails.bankId),
      accountName: paymentDetails.accountName,
      transactionId: paymentDetails.transactionId,
    };
  } else {
    gameRegistrationDetails.paymentDetails = null;
  }

  const registration = new Registration({
    tournament: new mongoose.Types.ObjectId(tournamentId),
    user: new mongoose.Types.ObjectId(userId),
    gameRegistrationDetails,
  });

  try {
    await registration.validate();
  } catch (validationError) {
    console.error(
      "Validation error:",
      JSON.stringify(validationError, null, 2)
    );
    throw new ApiError(400, `Validation failed: ${validationError.message}`);
  }

  await registration.save();

  return Response.json(
    new ApiResponse(
      201,
      registration,
      "Tournament registration created successfully"
    )
  );
});