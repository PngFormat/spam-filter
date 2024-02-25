const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const messages = [];

io.on('connection', (socket) => {
    console.log('Client connected');

    // Отримання повідомлень при підключенні
    socket.emit('initialMessages', messages);

    // Обробка нового повідомлення та відправка його всім клієнтам
    socket.on('sendMessage', (newMessage) => {
        const formattedMessage = { id: messages.length + 1, text: newMessage.text };
        messages.push(formattedMessage);
        io.emit('newMessage', formattedMessage);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(3001, () => {
    console.log('Server is running on port 3001');
});
