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

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
    }
};

export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await UserModel.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const authToken = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1h' });

        res.json({ authToken });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ message: 'Error during login' });
    }
};
