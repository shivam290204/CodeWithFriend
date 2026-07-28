import mongoose, { Schema, Document } from "mongoose";

export interface IEmailVerificationToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  used: boolean;
  createdAt: Date;
}

const EmailVerificationTokenSchema = new Schema<IEmailVerificationToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tokenHash: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

EmailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailVerificationToken = mongoose.model<IEmailVerificationToken>(
  "EmailVerificationToken",
  EmailVerificationTokenSchema
);
