import express from "express";
import { User } from "../models/user.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import {
  createJti,
  persistRefreshToken,
  rotateRefreshToken,
  setRefreshTokenCookie,
  signAccessToken,
  signRefreshToken,
} from "../utils/token.js";
import { RefreshToken } from "../models/refreshToken.js";

dotenv.config();

const authRouter = express.Router();
const SECRET = process.env.SECRET;

authRouter.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json("User already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        username,
        email,
        hashedPassword,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
    }

    const accessToken = signAccessToken(user);

    res.cookie("access-token", accessToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    const jti = createJti();
    const refreshToken = signRefreshToken(user, jti);

    await persistRefreshToken({
      user,
      refreshToken,
      jti,
      ip: req.ip,
      userAgent: req.headers["user-agent"] || "",
    });

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

authRouter.post("/refresh", async (req, res) => {
  try {
    const token = req.cookies?.refresh_token;
    if (!token) {
      return res.status(401).json({ message: "No refresh token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    const tokenHash = hashToken(token);
    const doc = await RefreshToken.findOne({tokenHash, jti: decoded.jti}).populate('user');

    if (!doc) {
      return res.status(401).json({ message: 'Refresh token not recognized' });
    }

    if (doc.revokedAt) {
      return res.status(401).json({ message: 'Refresh token has been revoked' });
    }

    if (doc.expiredAt < new Date()) {
      return res.status(401).json({ message: 'Refresh token has expired' });
    }

    const result = await rotateRefreshToken(req, res, doc.user, doc);

    return res.json({ accessToken: result.accessToken });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default authRouter;
