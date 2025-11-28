import mongoose from "mongoose";

const refreshTokenSchema = mongoose.Schema({
    user: {type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true},
    tokenHash: {type: String, required: true, unique: true},
    jti: {type: String, required: true, index: true},
    expiredAt: {type: Date, required: true, index: true},
    revokedAt: {type: Date, default: null},
    replacedBy: {type: String, default: null}, // New jti when rotated
    createdAt: {type: Date, default: Date.now},
    ip: String,
    userAgent: String,
})

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
