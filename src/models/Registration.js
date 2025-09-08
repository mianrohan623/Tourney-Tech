import { Schema, model, models } from "mongoose";

const GameRegistrationSchema = new Schema({
  game: { type: Schema.Types.ObjectId, ref: "Game", required: true },
  team: { type: Schema.Types.ObjectId, ref: "Team" }, // optional for solo
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  paid: { type: Boolean, default: false },
  paymentMethod: {
    type: String,
    enum: ["cash", "stripe", "manual"],
    default: "manual",
  },
  paymentDetails: { type: String, trim: true },
});

const RegistrationSchema = new Schema(
  {
    tournament: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // captain or solo player
    gameRegistrations: [GameRegistrationSchema],
  },
  { timestamps: true }
);

RegistrationSchema.index({ tournament: 1, user: 1 }, { unique: true });

export const Registration =
  models.Registration || model("Registration", RegistrationSchema);
