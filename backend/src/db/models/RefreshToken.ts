import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./User";

export interface IRefreshToken extends Document {
  user: IUser["_id"];
  token: string;
  expiresAt: Date;
}

const RefreshTokenSchema: Schema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

export default mongoose.model<IRefreshToken>(
  "RefreshToken",
  RefreshTokenSchema,
);
