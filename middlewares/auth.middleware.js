import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

const JWT_SECRET = process.env.SECRET;

export const auth = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Missing or invalid Authorization header' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        user = {id: decoded.id, email: decoded.email}

        req.user = user

        next();
    } catch (error) {
        if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired' });
    }
        return res.status(401).json({ message: 'Invalid token' });
    }
}
