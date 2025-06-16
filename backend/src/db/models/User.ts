import mongoose, { Schema, Document } from "mongoose";
import { verify } from "argon2";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(userPass: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters long"],
      maxlength: [30, "Username cannot exceed 30 characters"],
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
      required: [true, "Password is required"],
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
  return await verify(this.password, userPass);
};

const User = mongoose.model<IUser>("User", UserSchema);

export default User;
