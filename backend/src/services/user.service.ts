import User from "../db/models/User";
import { AppError, NotFoundError } from "../utils/errors";
import { UpdateUserInput } from "../validation/user.validation";
import { config } from "../config";

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
    throw new AppError(
      500,
      "Failed to update user profile due to server error."
    );
  }
}

export async function updateUserProfilePicture(userId: string, file: File) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    const fileName = `${userId}-${Date.now()}-${file.name}`;
    const filePath = `public/uploads/${fileName}`;

    await Bun.write(filePath, file);

    const fileUrl = `${config.API_BASE_URL}/public/uploads/${fileName}`;
    user.profilePictureUrl = fileUrl;
    await user.save();

    return {
      _id: user._id!.toString(),
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
    console.error("Error in updateUserProfilePicture service:", error);
    throw new AppError(
      500,
      "Failed to update user profile picture due to server error."
    );
  }
}
