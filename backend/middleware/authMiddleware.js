import { config } from 'dotenv';
config();
import jwt from 'jsonwebtoken';

const secretKey = 'key'
console.log('Secret key:', secretKey);

export const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access denied' });

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
};
