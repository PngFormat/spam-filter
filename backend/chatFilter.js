import Filter from 'bad-words';
import * as fs from "fs";
import { BlacklistedUserModel } from './Schema.js';
import natural from 'natural';

let rusProfanityFilter;
let rusBadWords;
const tokenizer = new natural.WordTokenizer();

fs.readFile('rusbadwords.json', 'utf-8', (err, data) => {
    if (err) {
        console.error('Error reading bad words file:', err);
        return;
    }
    rusBadWords = JSON.parse(data);
    rusProfanityFilter = new Filter({ list: rusBadWords, placeHolder: '*' });
});

const cachedFilteredMessages = new Map();

export const filterMessage = (text) => {
    if (cachedFilteredMessages.has(text)) {
        return cachedFilteredMessages.get(text);
    }

    let censoredText = text;
    let badWordCount = 0;

    if (rusProfanityFilter && rusProfanityFilter.isProfane(text)) {
        console.log('Message contains inappropriate content:', text);

        censoredText = tokenizer.tokenize(text).map((word) => {
            if (rusProfanityFilter.isProfane(word)) {
                badWordCount++;
                return '*'.repeat(word.length);
            }
            return word;
        }).join(' ');
    }

    const filteredResult = { censoredText, badWordCount };
    cachedFilteredMessages.set(text, filteredResult);

    return filteredResult;
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

export const updateBadWordsList = (newBadWordsList) => {
    rusBadWords = newBadWordsList;
    rusProfanityFilter = new Filter({ list: rusBadWords, placeHolder: '*' });
    cachedFilteredMessages.clear();
};

export const filterMessagesInParallel = async (messages) => {
    const filteredMessages = await Promise.all(messages.map(message => filterMessage(message)));
    return filteredMessages;
};

export const setProfanityFilterOptions = (options) => {
    if (rusProfanityFilter) {
        rusProfanityFilter = new Filter({ list: rusBadWords, ...options });
        cachedFilteredMessages.clear();
    }
};

export const runFilterTests = () => {
    const testMessages = ["Test message 1 with bad word", "Test message 2 without bad words"];
    console.log("Running filter tests...");

    testMessages.forEach(message => {
        const result = filterMessage(message);
        console.log("Original message:", message);
        console.log("Filtered message:", result.censoredText);
        console.log("Bad word count:", result.badWordCount);
    });

    console.log("Filter tests complete.");
};
