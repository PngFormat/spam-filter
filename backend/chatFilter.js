import Filter from 'bad-words';
import * as fs from "fs";
import { BlacklistedUserModel } from './Schema.js';

const rusBadWords = JSON.parse(fs.readFileSync('rusbadwords.json', 'utf-8'));
const rusProfanityFilter = new Filter({ list: rusBadWords, options: { caseSensitive: false } });

export const filterMessage = (text) => {
    let censoredText = text;
    let badWordCount = 0;

    if (rusProfanityFilter.isProfane(text)) {
        console.log('Message contains inappropriate content:', text);

        censoredText = text.replace(rusProfanityFilter, (match) => {
            badWordCount++;
            return '*'.repeat(match.length);
        });
    }

    return { censoredText, badWordCount };
};

export const addToBlackList = async (username, reason) => {
    try {
        const existingBlacklistedUser = await BlacklistedUserModel.findOne({ username });
        if (existingBlacklistedUser) {
            console.log('User already blacklisted:', username);
            return;
        }
        const blacklistedUser = new BlacklistedUserModel({ username, reason });
        await blacklistedUser.save();

        console.log('User added to blacklist:', username);
    } catch (error) {
        console.error('Error adding user to blacklist:', error);
        throw error;
    }
};