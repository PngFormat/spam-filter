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

config();
const secretKey = 'key';
const generateAuthToken = (user) => {
    return jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
};

const profanityFilter = new Filter();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

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

console.log(`Initial connection status: ${db.readyState}`);

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,

});

const messageSchema = new mongoose.Schema({
    text: String,
    username: String,
});

const MessageModel = mongoose.model('Message', messageSchema);
const UserModel = mongoose.model('User', userSchema);

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.post('/api/messages', async (req, res) => {
    const { text, username } = req.body;
    console.log('Received message:', req.body);

    const isMessageAllowed = (messageText) => {
        return !filter.isProfane(messageText);
    };

    if (profanityFilter.isProfane(text)) {
        console.log('Message contains inappropriate content:', text);
        return res.status(400).json({ message: 'Сообщение содержит нежелательный контент и не может быть отправлено' });
    }

    try {
        const newMessage = new MessageModel({ text, username });
        await newMessage.save();
        console.log('Message saved successfully:', newMessage);
        io.emit('newMessage', newMessage);
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


app.delete('/api/messages/:messageId', async (req, res) => {
    const { messageId } = req.params;
    try {
        const deletedMessage = await MessageModel.findByIdAndDelete(messageId);
        if (!deletedMessage) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.status(200).json({ message: 'Message deleted successfully', deletedMessage });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Error deleting message' });
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
        res.json(user);
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
