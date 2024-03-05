import express from 'express';
import http from 'http';
import * as socketIO from 'socket.io';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import bcrypt from 'bcrypt';
import cors from 'cors'
import { authenticateToken } from './middleware/authMiddleware.js';


// import generateAuthToken from '../backend/auth-jwt-token.js';
import jwt from "jsonwebtoken";
const secretKey = process.env.JWT_SECRET_KEY || 'default-secret-key';

const generateAuthToken = (user) => {
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    return token;
};
const existingUser = await UserModel.findOne({ $or: [{ username }, { email }] });
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
    const { user } = socket.request;

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });

    socket.on('sendMessage', (message) => {
        const newMessage = { userId: user._id, text: message.text, username: user.username };
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
    name: String,
    nickname: String,
});

const UserModel = mongoose.model('User', userSchema);

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.post('/api/messages', async (req, res) => {
    const { text, username } = req.body;

    let user = await UserModel.findOne({ nickname: username });
    if (!user) {
        user = await UserModel.create({ name: 'DefaultName', nickname: username });
    }

    const newMessage = { id: messages.length + 1, text, username };
    messages.push(newMessage);
    io.emit('newMessage', newMessage);
    res.json(newMessage);
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

        const authToken = generateAuthToken(user);

        res.status(200).json({ authToken });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error during login' });
    }
});

app.get('/api/messages/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const userMessages = messages.filter(message => message.userId === userId);
        res.status(200).json(userMessages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});

app.get('/api/messages/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const messages = await MessageModel.find({ userId }).sort({ createdAt: 'asc' });

        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});

app.post('/api/users', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    try {
        // Your registration logic here

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering user' });
    }
});


server.listen(3001, () => {
    console.log('Server is running on port 3001');
});
