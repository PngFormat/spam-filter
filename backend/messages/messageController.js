import {BlacklistedReceiverModel, MessageModel, UserModel} from '../Schema.js';
import { addToBlackList, filterMessage } from '../chatFilter.js';
import { checkMessageLimit, checkUserProfanity } from "./messageMiddleware.js";
import { BlacklistedUserModel } from "../Schema.js";

const userBadWordCount = {};
const lastMessageTime = {};
const messageCount = {};

const userMessageCount = {};

const incrementUserMessageCount = async (userId) => {
    if (!userMessageCount[userId]) {
        userMessageCount[userId] = 1;
    } else {
        userMessageCount[userId]++;
    }
};

export const postMessage = async (req, res) => {
    const { text, userId, username } = req.body;
    console.log('Received message:', req.body);

    try {
        const currentTime = Date.now();
        checkMessageLimit(username, messageCount, lastMessageTime, currentTime, res);

        await checkUserProfanity(username, userBadWordCount, addToBlackList, res);

        const { censoredText, badWordCount } = filterMessage(text);

        if (badWordCount > 0) {
            userBadWordCount[username] = (userBadWordCount[username] || 0) + badWordCount;
        }

        lastMessageTime[username] = currentTime;

        const isSenderBlacklisted = await BlacklistedUserModel.findOne({ username });
        if (isSenderBlacklisted) {
            return res.status(403).json({ message: 'You are blacklisted and cannot send messages' });
        }

        const isReceiverBlacklisted = await BlacklistedReceiverModel.findOne({ receiverId: userId });
        if (isReceiverBlacklisted) {
            return res.status(403).json({ message: 'You are blacklisted and cannot receive messages' });
        }

        const newMessage = new MessageModel({ text: censoredText, username, userId });
        await newMessage.save();
        console.log('Message saved successfully:', newMessage);

        await incrementUserMessageCount(userId);
        console.log(userMessageCount)
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error posting message:', error);
        res.status(500).json({ message: 'Error posting message' });
    }
};

export const getUserMessageCount = async (req, res) => {
    try {
        const users = await UserModel.find();
        const userMessageCounts = {};
        for (const user of users) {
            const userId = user._id;
            const messages = await MessageModel.find({ userId });
            const messageCount = messages.length;
            userMessageCounts[user.username] = messageCount;
        }

        res.status(200).json(userMessageCounts);
    } catch (error) {
        console.error('Error fetching user message count:', error);
        res.status(500).json({ message: 'Error fetching user message count' });
    }
};





export const getUserMessageCountController = async (req, res) => {
    try {
        const { userId } = req.body;
        const messageCount = await getUserMessageCount(userId);
        res.status(200).json({ userId, messageCount });
    } catch (error) {
        console.error('Error fetching user message count:', error);
        res.status(500).json({ message: 'Error fetching user message count' });
    }
};

export const getMessages = async (req, res) => {
    try {
        const messages = await MessageModel.find();
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

export const deleteMessage = async (req, res) => {
    const { messageId } = req.params;
    console.log(messageId, 'test');

    try {
        const deletedMessage = await MessageModel.findByIdAndDelete(messageId);
        console.log(deletedMessage, 'text');
        if (!deletedMessage) {
            return res.status(404).json({ message: 'Message not found or could not be deleted' });
        }

        res.status(200).json({ message: 'Message deleted successfully', deletedMessage });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Error deleting message' });
    }
};
