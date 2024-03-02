import express from 'express'
import http from 'http'
import * as socketIO from 'socket.io';
import bodyParser from 'body-parser'
import mongoose from 'mongoose';
import {Server} from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

app.use(bodyParser.json());

mongoose.connect('mongodb+srv://<alfaran>:<12345678den>@cluster0.kuuevk3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
const db = mongoose.connection;


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

// Создание модели пользователя
const UserModel = mongoose.model('User', userSchema);

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


// Обработчик POST-запроса для /api/messages
app.post('/api/messages', async (req, res) => {
    const { text, username } = req.body;

    // Сохранение пользователя в базу данных, если он не существует
    let user = await UserModel.findOne({ nickname: username });
    if (!user) {
        user = await UserModel.create({ name: 'DefaultName', nickname: username });
    }

    // Отправка сообщения с учетом пользователя
    const newMessage = { id: messages.length + 1, text, username };
    messages.push(newMessage);
    io.emit('newMessage', newMessage);
    res.json(newMessage);
});

server.listen(3001, () => {
    console.log('Server is running on port 3001');
});
