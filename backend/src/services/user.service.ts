import User, { IUser } from "../db/models/User";
import { AppError, NotFoundError } from "../utils/errors";
import { UpdateUserInput } from "../validation/user.validation";

export async function updateUserProfile(
  userId: string,
  userData: UpdateUserInput
) {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new NotFoundError("User not found.");
    }

    if (userData.firstName) {
      user.firstName = userData.firstName;
    }

    if (userData.lastName) {
      user.lastName = userData.lastName;
    }

    if (userData.profilePictureUrl) {
      user.profilePictureUrl = userData.profilePictureUrl;
    }

    await user.save();

    return {
      _id: user._id!.toString(),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePictureUrl: user.profilePictureUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error in updateUserProfile service:", error);
    throw new AppError(500, "Failed to update user profile due to server error.");
  }
}
