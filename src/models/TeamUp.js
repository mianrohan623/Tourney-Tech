import { Schema, model, models } from "mongoose";

const TeamUpSchema = new Schema(
  {
    from: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tournament: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      required: true,
    },
    to: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    message: {
      type: String,
    },
  },
  { timestamps: true }
);

TeamUpSchema.index({ from: 1, to: 1 }, { unique: true });

export const TeamUp = models.TeamUp || model("TeamUp", TeamUpSchema);
