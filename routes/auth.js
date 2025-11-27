import express from "express";
import { User } from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const SECRET = process.env.SECRET;

router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json("User already exists");
    }

    const hashedPassword = await bcrypt.compare(password, 10);

    const newUser = await User({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body();

    const user = await User.findOne({ email });

    if (!user) {
      res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
    }

    const payload = { id: user._id, email: user.email };
    const token = jwt.sign(payload, SECRET, { expiresIn: "15m" });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
