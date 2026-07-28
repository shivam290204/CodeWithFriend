import jwt from "jsonwebtoken";
import crypto from "crypto";

export function generateAccessToken(user: { id: string; name: string; email: string }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");

  return jwt.sign(
    { id: user.id, name: user.name, email: user.email },
    secret,
    { expiresIn: "15m" } // 15 minutes expiry
  );
}

export function generateRefreshToken() {
  const raw = crypto.randomBytes(32).toString("hex");
  const hash = hashToken(raw);
  return { raw, hash };
}

export function hashToken(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
