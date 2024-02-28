const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

app.use(bodyParser.json());

const messages = [];


const generateRandomMessage = () => {
    const randomText = `Random message ${Math.floor(Math.random() * 100)}`;
    const randomUsername = `User${Math.floor(Math.random() * 10)}`;
    return { id: messages.length + 1, text: randomText, username: randomUsername };
};


setInterval(() => {
    const randomMessage = generateRandomMessage();
    messages.push(randomMessage);
    io.emit('newMessage', randomMessage);
}, 3000);

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.emit('initialMessages', messages);

    socket.on('sendMessage', (newMessage) => {
        const formattedMessage = { id: messages.length + 1, text: newMessage.text };
        messages.push(formattedMessage);
        io.emit('newMessage', formattedMessage);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

app.get('/api/messages', (req, res) => {

    res.json(messages);
});


app.post('/api/messages', (req, res) => {
    const { text, username } = req.body;
    const newMessage = { id: messages.length + 1, text, username };
    messages.push(newMessage);
    io.emit('newMessage', newMessage);
    res.json(newMessage);
});

server.listen(3001, () => {
    console.log('Server is running on port 3001');
});

app.options('/api/messages', cors());
app.use(bodyParser.json());
app.use(cors());