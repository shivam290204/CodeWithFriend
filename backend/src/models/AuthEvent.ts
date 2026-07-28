import mongoose, { Schema, Document } from "mongoose";

export interface IAuthEvent extends Document {
  userId?: mongoose.Types.ObjectId;
  email?: string;
  eventType:
    | "login_success"
    | "login_failed"
    | "signup"
    | "password_reset_requested"
    | "password_reset_completed"
    | "password_changed"
    | "logout"
    | "logout_all"
    | "refresh_token_rotated"
    | "email_verified";
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuthEventSchema = new Schema<IAuthEvent>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    email: { type: String },
    eventType: {
      type: String,
      enum: [
        "login_success",
        "login_failed",
        "signup",
        "password_reset_requested",
        "password_reset_completed",
        "password_changed",
        "logout",
        "logout_all",
        "refresh_token_rotated",
        "email_verified",
      ],
      required: true,
    },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: true }
);

export const AuthEvent = mongoose.model<IAuthEvent>("AuthEvent", AuthEventSchema);
