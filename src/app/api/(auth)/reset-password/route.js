import { User } from "@/models/User";
import { ApiResponse } from "@/utils/server/ApiResponse";
import { asyncHandler } from "@/utils/server/asyncHandler";

export const POST = asyncHandler(async (req) => {
  const { token, newPassword } = await req.json();

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return Response.json(new ApiResponse(400, null, "Invalid or expired reset token."));
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  return Response.json(new ApiResponse(200, null, "Password reset successfully."));
});
