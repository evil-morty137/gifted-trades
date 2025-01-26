import jwt from 'jsonwebtoken';
import User from '../models/users.model';

export const loginResponse = async (userId: string) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    const accessToken = generateAccessToken({ userId });
    return {
        user,
        accessToken
    };
};

export const generateAccessToken = (payload: { userId: string }) => {
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
        algorithm: 'HS256',
        expiresIn: '24h',
        issuer: 'application'
    });

    return accessToken;
};
