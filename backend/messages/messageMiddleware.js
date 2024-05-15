import { BlacklistedUserModel, BlacklistedReceiverModel } from '../Schema.js';


export const checkUserProfanity = async (username, userBadWordCount, addToBlackList, res) => {
    if (userBadWordCount[username] && userBadWordCount[username] >= 2) {
        try {
            await addToBlackList(username, 'inappropriate language');
            return res.status(403).json({ message: 'You are blocked for inappropriate behavior' });
        } catch (error) {
            console.error('Error adding user to blacklist:', error);
            return res.status(500).json({ message: 'Error adding user to blacklist' });
        }
    }
};
