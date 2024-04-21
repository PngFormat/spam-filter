import { BlacklistedUserModel, BlacklistedReceiverModel } from '../Schema.js';

export const checkMessageLimit = (username, messageCount, lastMessageTime, currentTime, res) => {
    if (messageCount[username] && messageCount[username] >= 3) {
        if (lastMessageTime[username]) {
            const timeDifference = currentTime - lastMessageTime[username];
            if (timeDifference < 6000) {
                const timeLeft = Math.ceil((6000 - timeDifference) / 1000);
                return res.status(429).json({ message: `Please wait ${timeLeft} seconds before sending another message` });
            }
        }
    }
};

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
