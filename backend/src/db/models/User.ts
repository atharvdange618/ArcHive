import mongoose, { Schema, Document } from "mongoose";
import { verify } from "argon2";
import { ConflictError } from "src/utils/errors";

export interface IUser extends Document {
  googleId?: string;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(userPass: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [
        function (this: IUser) {
          return !this.googleId;
        },
        "Password is required",
      ],
    },
    firstName: {
      type: String,
      required: [
        function (this: IUser) {
          return !this.googleId;
        },
        "First name is required",
      ],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [
        function (this: IUser) {
          return !this.googleId;
        },
        "Last name is required",
      ],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    profilePictureUrl: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// --- Custom Schema Methods ---

// Method to compare user password with the stored hashed password
UserSchema.methods.comparePassword = async function (
  this: IUser,
  userPass: string
): Promise<boolean> {
  if (!this.password) {
    throw new ConflictError("Password is not set for this user.");
  }
  return await verify(this.password, userPass);
};

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
