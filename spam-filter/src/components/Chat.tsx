import React, { useEffect, useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import styles from '../styles/Home.module.css';
import axios from 'axios';

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

interface ChatProps {
    currentUser: User;
    username: string;
}

const Chat: React.FC<ChatProps> = ({ currentUser,username }) => {
    const classes = styles;
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');

    useEffect(() => {
        const fetchCurrentUser = async () => {
            try {
                const response = await axios.get(`/api/user/${currentUser}`, {

                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                console.log(response.data);
            } catch (error) {
                console.error('Error fetching current user:', error);
            }
        };

        fetchCurrentUser();
    }, []);

    const handleSendMessage = () => {
        if (!newMessage.trim()) {
            console.warn('Message text is empty');
            return;
        }

        if (currentUser) {
            axios.post('http://localhost:3001/api/messages', { text: newMessage, username: currentUser.nickname })
                .then(response => {
                    setMessages(prevMessages => [...prevMessages, response.data]);
                    setNewMessage('');
                })
                .catch(error => {
                    console.error('Error sending message:', error);
                    alert('Failed to send message. Please try again later.');
                });
        } else {
            alert('You need to log in first.');
        }
    };

    return (
        <div>
            <Typography variant="body1" paragraph>
                Welcome, {username} ({currentUser.id})!
            </Typography>

            <ul className={classes.messageList}>
                {messages.map(message => (
                    <li key={message.id} className={classes.messageItem}>
                        <strong>{username}: </strong>
                        {message.text}
                    </li>
                ))}
            </ul>

            <div className={classes.inputContainer}>
                <TextField
                    className={classes.input}
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={handleSendMessage}>
                    Send
                </Button>
            </div>
        </div>
    );
};

export default Chat;
