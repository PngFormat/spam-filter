import { BlacklistedUserModel } from '../Schema.js';
import {UserModel} from "../Schema.js";

export const addToBlacklist = async (req, res) => {
    const { username, reason } = req.body;

    try {
        const existingUser = await UserModel.findOne({ username });
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const existingBlacklistedUser = await BlacklistedUserModel.findOne({ username });
        if (existingBlacklistedUser) {
            return res.status(400).json({ message: 'User already blacklisted' });
        }

        const blacklistedUser = new BlacklistedUserModel({ username, reason });
        await blacklistedUser.save();

        res.status(201).json({ message: `User ${username} added to blacklist for reason: ${reason}` });
    } catch (error) {
        console.error('Error adding user to blacklist:', error);
        res.status(500).json({ message: 'Error adding user to blacklist' });
    }
};

export const getBlacklist = async (req, res) => {
    try {
        const blacklist = await BlacklistedUserModel.find({}, 'username reason');
        res.status(200).json(blacklist);
    } catch (error) {
        console.error('Error fetching blacklist:', error);
        res.status(500).json({ message: 'Error fetching blacklist' });
    }
};

export const removeFromBlacklist = async (req, res) => {
    const { userId } = req.params;
    console.log(userId , 'id')
    try {
        const deletedUser = await BlacklistedUserModel.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).json({ message: 'User is not blacklisted' });
        }

        res.status(200).json({ message: `User ${userId} has been removed from the blacklist` });
    } catch (error) {
        console.error('Error removing user from blacklist:', error);
        res.status(500).json({ message: 'Error removing user from blacklist' });
    }
};
