import { Schema, model, models } from "mongoose";

const MatchSchema = new Schema(
  {
    tournament: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
    matchNumber: { type: Number, required: true },
    bracketGroup: { type: Schema.Types.ObjectId, ref: "BracketGroup" },
    round: { type: Number, required: true },
    qr: { type: String },
    teamA: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    teamB: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    winner: { type: Schema.Types.ObjectId, ref: "Team" },
    loser: { type: Schema.Types.ObjectId, ref: "Team" },
    score: { type: String },
    scheduledAt: { type: Date },
    completedAt: { type: Date },
    nextMatch: { type: Schema.Types.ObjectId, ref: "Match" },
    admin: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

MatchSchema.index({ tournament: 1, game: 1, matchNumber: 1 }, { unique: true });

export const Match = models.Match || model("Match", MatchSchema);
