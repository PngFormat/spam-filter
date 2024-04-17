import mongoose from 'mongoose';

const blacklistedUserSchema = new mongoose.Schema({
    username: String,
    reason: String,
});

const blacklistedReceiverSchema = new mongoose.Schema({
    senderId: String,
    receiverId: String,
});

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
});

const messageSchema = new mongoose.Schema({
    id: String,
    text: String,
    username: String,
});

export const BlacklistedUserModel = mongoose.model('BlacklistedUser', blacklistedUserSchema);
export const BlacklistedReceiverModel = mongoose.model('BlacklistedReceiver', blacklistedReceiverSchema);
export const UserModel = mongoose.model('User', userSchema);
export const MessageModel = mongoose.model('Message', messageSchema);
