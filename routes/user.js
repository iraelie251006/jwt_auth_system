import express from "express";
import { User } from "../models/user.js";
import { auth } from "../middlewares/auth.middleware.js";

export const userRouter = express.Router();

userRouter.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
})
