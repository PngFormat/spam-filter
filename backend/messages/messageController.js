import {BlacklistedReceiverModel, MessageModel} from '../Schema.js';
import {addToBlackList, filterMessage} from '../chatFilter.js';
import {checkMessageLimit, checkUserProfanity} from "./messageMiddleware.js";
import {BlacklistedUserModel} from "../Schema.js";
const userBadWordCount = {};
const lastMessageTime = {};
const messageCount = {};
export const postMessage = async (req, res) => {
    const { text, userId, username } = req.body;
    console.log('Received message:', req.body);

    const currentTime = Date.now();
    checkMessageLimit(username, messageCount, lastMessageTime, currentTime, res);

    await checkUserProfanity(username, userBadWordCount, addToBlackList, res);

    const { censoredText, badWordCount } = filterMessage(text);

    if (badWordCount > 0) {
        userBadWordCount[username] = (userBadWordCount[username] || 0) + badWordCount;
    }

    lastMessageTime[username] = currentTime;

    try {
        const isSenderBlacklisted = await BlacklistedUserModel.findOne({ username });
        if (isSenderBlacklisted) {
            return res.status(403).json({ message: 'You are blacklisted and cannot send messages' });
        }

        const isReceiverBlacklisted = await BlacklistedReceiverModel.findOne({ receiverId: userId });
        if (isReceiverBlacklisted) {
            return res.status(403).json({ message: 'You are blacklisted and cannot receive messages' });
        }

        const newMessage = new MessageModel({ text: censoredText, username });
        await newMessage.save();
        console.log('Message saved successfully:', newMessage);

        messageCount[username] = (messageCount[username] || 0) + 1;

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ message: 'Error saving message' });
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
    console.log(messageId,'test');

    try {
        const deletedMessage = await MessageModel.findOneAndDelete({ _id: messageId });
        console.log(deletedMessage,'text');
        if (!deletedMessage) {
            return res.status(404).json({ message: 'Message not found or could not be deleted' });
        }

        res.status(200).json({ message: 'Message deleted successfully', deletedMessage });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Error deleting message' });
    }
};
