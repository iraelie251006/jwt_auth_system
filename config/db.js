import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI;

const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            dbName: "JWTAUTH",
            retryWrites: true,
            serverSelectionTimeoutMS: 30000,
        });
        console.log("MongoDB connected successfully 😁.");
    } catch (error) {
        console.log(`Error occured: ${error}`);
        process.exit(1);
    }
}

export default connectDB;
