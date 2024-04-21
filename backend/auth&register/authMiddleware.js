import jwt from 'jsonwebtoken';
import { UserModel } from '../Schema.js';

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, 'secretKey', async (err, decoded) => {
        if (err) {
            return res.sendStatus(403);
        }

        try {
            const user = await UserModel.findById(decoded.userId);
            if (!user) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        } catch (error) {
            console.error('Error authenticating token:', error);
            res.sendStatus(500);
        }
    });
};
