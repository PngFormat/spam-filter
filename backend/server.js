import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import bcrypt from 'bcrypt';
import cors from 'cors';
import jwt from "jsonwebtoken";
import { authenticateToken } from './middleware/authMiddleware.js';
import { config } from 'dotenv';
import Filter from 'bad-words';
import * as fs from "fs";
import { BlacklistedUserModel, BlacklistedReceiverModel, UserModel, MessageModel } from './Schema.js';
import addToBlackList from "./addToBlackList.js";
const secretKey = 'key';
const userBadWordCount = {};
const blacklistedUsers = {};
const lastMessageTime = {};
const messageCount = {};
const rusBadWords = JSON.parse(fs.readFileSync('rusbadwords.json', 'utf-8'));
const rusProfanityFilter = new Filter({ list: rusBadWords, options: { caseSensitive: false } });
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',

        methods: ['GET', 'POST'],
        credentials: true,
    },
});

config();

app.use(cors({
    origin: 'http://localhost:3000',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));
app.use(bodyParser.json());
const messages = [];

app.use((req, res, next) => {
    console.log(`Received ${req.method} request at ${req.url}`);
    next();
});

mongoose.connect('mongodb+srv://alfaran:12345678den4@cluster0.kuuevk3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
const db = mongoose.connection;

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    socket.on('sendMessage', (message) => {
        const newMessage = { text: message.text, username: message.username };
        messages.push(newMessage);
        io.emit('newMessage', newMessage);
    });
});

db.on('open', () => {
    console.log('Connected to MongoDB!');
});

db.on('error', (err) => {
    console.error(`MongoDB connection error: ${err}`);
});

db.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
});

db.on('close', () => {
    console.log('Connection to MongoDB closed');
});

console.log(`Initial caonnection status: ${db.readyState}`);




io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.post('/api/blacklist', async (req, res) => {
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
});

app.get('/api/blacklist', async (req, res) => {
    try {
        const blacklist = await BlacklistedUserModel.find({}, 'username reason');
        res.status(200).json(blacklist);
    } catch (error) {
        console.error('Error fetching blacklist:', error);
        res.status(500).json({ message: 'Error fetching blacklist' });
    }
});

app.post('/api/messages', async (req, res) => {
    const { text, userId, username } = req.body;
    console.log('Received message:', req.body);

    const currentTime = Date.now();

    if (messageCount[username] && messageCount[username] >= 3) {
        if (lastMessageTime[username]) {
            const timeDifference = currentTime - lastMessageTime[username];

            if (timeDifference < 6000) {
                const timeLeft = Math.ceil((6000 - timeDifference) / 1000);
                return res.status(429).json({ message: `Пожалуйста, подождите ${timeLeft} секунд перед отправкой следующего сообщения` });
            }
        }
    }

    if (userBadWordCount[username] && userBadWordCount[username] >= 2) {
        await addToBlackList(username, 'матерные сообщения');
        return res.status(403).json({ message: 'Вы заблокированы за некорректное поведение' });
    }

    let censoredText = text;
    let badWordCount = 0;

    if (rusProfanityFilter.isProfane(text)) {
        console.log('Message contains inappropriate content:', text);

        censoredText = text.replace(rusProfanityFilter, (match) => {
            badWordCount++;
            console.log(badWordCount)
            return '*'.repeat(match.length);
        });

        if (badWordCount > 0) {
            userBadWordCount[username] = (userBadWordCount[username] || 0) + badWordCount;
        }
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
        io.emit('newMessage', newMessage);

        messageCount[username] = (messageCount[username] || 0) + 1;

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ message: 'Error saving message' });
    }
});


app.get('/api/messages', async (req, res) => {
    try {
        const messages = await MessageModel.find();
        res.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
});


app.delete('/api/messages/:messageText', async (req, res) => {
    const { messageText } = req.params;
    const userId = req.user?.id;

    try {
        const deletedMessage = await MessageModel.findOneAndDelete({ text: messageText, userId });


        if (!deletedMessage) {
            return res.status(404).json({ message: 'Сообщение не найдено или не удалось удалить' });
        }

        res.status(200).json({ message: 'Сообщение удалено успешно', deletedMessage });
    } catch (error) {
        console.error('Ошибка при удалении сообщения:', error);
        res.status(500).json({ message: 'Ошибка при удалении сообщения' });
    }
});

app.post('/api/register', async (req, res) => {
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
});

app.get('/api/users', async (req, res) => {

    try {
        const users = await UserModel.find();
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

app.get('/api/user/:username', async (req, res) => {
    const { username } = req.params;
    console.log(username);
    try {
        const user = await UserModel.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ id: user._id, ...user.toObject() });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

app.get('/api/protected-route', authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});

app.post('/api/login', async (req, res) => {
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
});


app.get('/api/user/:username', async (req, res) => {
    const { username } = req.params;

    try {

        const user = await UserModel.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

server.listen(3001, () => {
    console.log('Server is running on port 3001');
});