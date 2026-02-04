import User from "../db/models/User";
import { AppError, NotFoundError } from "../utils/errors";
import { UpdateUserInput } from "../validation/user.validation";
import cloudinary from "../config/cloudinary";
import { Readable } from "stream";

export async function updateUserProfile(
  userId: string,
  userData: UpdateUserInput,
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
      "Failed to update user profile due to server error.",
    );
  }
}

export async function updateUserProfilePicture(userId: string, file: File) {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found.");
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `archive/users/${userId}/profile`,
          public_id: `profile-picture`,
          resource_type: "image",
          format: "jpg",
          overwrite: true,
          transformation: [
            { width: 500, height: 500, crop: "fill", gravity: "face" },
            { quality: "auto:good" },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      const bufferStream = Readable.from(buffer);
      bufferStream.pipe(uploadStream);
    });

    const cloudinaryUrl = (uploadResult as any).secure_url;

    user.profilePictureUrl = cloudinaryUrl;
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
      "Failed to update user profile picture due to server error.",
    );
  }
}
