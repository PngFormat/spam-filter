import React, { useEffect, useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import styles from '../styles/Home.module.css';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

interface Message {
    _id: string;
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

const Chat: React.FC<ChatProps> = ({ currentUser, username }) => {
    const classes = styles;
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('')



    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/messages');
                const storedMessages = response.data;
                storedMessages.forEach((message: { _id: string; }) => {
                    console.log('id:', message._id);
                });
                setMessages(storedMessages);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, []);

    useEffect(() => {
        return () => {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
        };
    }, [messages]);

    const handleSendMessage = () => {
        if (!newMessage.trim()) {
            console.warn('Message text is empty');
            return;
        }
        console.log('UserId' + currentUser.id)
        if (currentUser) {
            axios.post('http://localhost:3001/api/messages', { text: newMessage, userId: currentUser.id, username })

                .then(response => {
                    const newMessageObj: Message = response.data;
                    setMessages(prevMessages => [...prevMessages, newMessageObj]);
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

    const handleDeleteMessage = (messageId: string) => {
        console.log("Deleting message with ID:", messageId);
        const authToken = localStorage.getItem('authToken');
        axios.delete(`http://localhost:3001/api/messages/${messageId}`, {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        })
            .then(response => {
                setMessages(prevMessages => prevMessages.filter(message => message._id !== messageId));
            })
            .catch(error => {
                console.error('Error deleting message:', error);
                alert('Failed to delete message. Please try again later.');
            });
    };





    return (
        <div>
            <Typography variant="body1" paragraph>
                Welcome, {username} ({currentUser.id})!
            </Typography>

            <ul className={classes.messageList}>
                {messages.map(message => (
                    <li key={message._id} className={classes.messageItem}>
                        <strong>{message.username}: </strong>
                        {message.text}
                        {message.username === username && (
                            <Button variant="outlined" color="error" onClick={() => handleDeleteMessage(message._id)}>
                                Delete
                            </Button>
                        )}
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
