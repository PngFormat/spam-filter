import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../Schema.js';

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({ username, email, password: hashedPassword });

        await newUser.save();

        const authToken = jwt.sign({ userId: newUser._id }, 'secretKey', { expiresIn: '1h' });

        res.status(201).json({ authToken, user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
    }
};