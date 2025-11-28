import dotenv from "dotenv";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { RefreshToken } from "../models/refreshToken.js";

dotenv.config();
const REFRESH_TTL_SEC = 60 * 60 * 24 * 7;

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function createJti() {
  return crypto.randomBytes(16).toString("hex");
}

function signAccessToken(user) {
  const payload = { sub: user._id.toString(), email: user.email };
  return jwt.sign(payload, process.env.SECRET, {
    expiresIn: process.env.ACCESS_TTL,
  });
}

function signRefreshToken(user, jti) {
  const payload = { sub: user._id.toString(), jti };
  const token = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TTL_SEC,
  });
  return token;
}

async function persistRefreshToken({ user, refreshToken, jti, ip, userAgent }) {
  const refreshTokenHash = hashToken(refreshToken);
  const expiredAt = new Date(Date.now() + REFRESH_TTL_SEC * 1000);
  await RefreshToken.create({
    user: user._id,
    refreshTokenHash,
    jti,
    expiredAt,
    ip,
    userAgent,
  });
}

function setRefreshTokenCookie(res, refreshToken) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: "strict",
    maxAge: REFRESH_TTL_SEC * 1000,
    path: "/api/auth/refresh",
  });
}

async function rotateRefreshToken(req, res, user, oldDoc) {
  // revoke old
  oldDoc.revokedAt = new Date();
  const newJtio = createJti();
  oldDoc.replacedBy = newJtio;
  await oldDoc.save();

  // issue new
  const newAccessToken = signAccessToken(user);
  const newRefreshToken = signRefreshToken(user, newJtio);
  await persistRefreshToken({
    user,
    refreshToken: newRefreshToken,
    jti: newJtio,
    ip: req.ip,
    userAgent: req.headers["user-agent"] || "",
  });
  setRefreshTokenCookie(res, newRefreshToken);
  res.json({ accessToken: newAccessToken });
}

export {
  hashToken,
  createJti,
  signAccessToken,
  signRefreshToken,
  persistRefreshToken,
  setRefreshTokenCookie,
  rotateRefreshToken
};
