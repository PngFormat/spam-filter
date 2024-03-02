import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';

interface Message {
    id: number;
    text: string;
    username: string;
}

interface User {
    id: number;
    name: string;
    nickname: string;
}


const ChatRoom: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const socket = io('http://localhost:3001', { transports: ['websocket'] });

    useEffect(() => {
        const name = prompt('Enter your name:');
        const nickname = prompt('Enter your nickname:');

        if (name && nickname) {
            const user: User = { id: Date.now(), name, nickname };
            setCurrentUser(user);
        } else {
            alert('Please enter valid name and nickname.');
        }
    }, []);

    useEffect(() => {
        axios.get('http://localhost:3001/api/messages')
            .then(response => setMessages(response.data))
            .catch(error => console.error('Error fetching initial messages:', error));

        socket.on('newMessage', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        return () => {
            socket.disconnect();
        };
    }, [socket]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) {
            console.warn('Message text is empty');
            return;
        }

        if (currentUser) {
            axios.post('http://localhost:3001/api/messages', { text: newMessage, username: currentUser.nickname })
                .then(response => {
                    setMessages((prevMessages) => [...prevMessages, response.data]);
                    setNewMessage('');
                })
                .catch(error => console.error('Error sending message:', error));
        } else {
            alert('You need to log in first.');
        }
    };

    return (
        <div>
            <h2>Chat Room</h2>
            {currentUser && (
                <div>
                    <p>Welcome, {currentUser.name} ({currentUser.nickname})!</p>
                </div>
            )}
            <ul>
                {messages.map(message => (
                    <li key={message.id}>
                        <strong>{message.username}: </strong>
                        {message.text}
                    </li>
                ))}
            </ul>
            <div>
                <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                />
                <button onClick={handleSendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatRoom;