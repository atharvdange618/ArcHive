import mongoose, { Schema, Document } from "mongoose";

export interface IBlacklistedToken extends Document {
  token: string;
  expiresAt: Date;
}

const BlacklistedTokenSchema: Schema = new Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: "1s" },
  },
});

export default mongoose.model<IBlacklistedToken>(
  "BlacklistedToken",
  BlacklistedTokenSchema,
);
