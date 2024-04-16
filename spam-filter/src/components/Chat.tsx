import React, { useEffect, useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import styles from '../styles/Home.module.css';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Filter from 'bad-words';
import rusBadWords from '../rusbadwords.json';

interface Message {
    _id: string;
    text: string;
    username: string;
}

interface User {
    id: number;
    username: string;
    nickname: string;
}

interface ChatProps {
    currentUser: User;
    username: string;
}

const Chat: React.FC<ChatProps> = ({ currentUser, username }) => {
    const classes = styles;
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const filter = new Filter();
    const rusFilter = new Set(rusBadWords);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/messages');
                const storedMessages = response.data;
                setMessages(storedMessages);
            } catch (error) {
                console.error('Error fetching messages:', error);
            }
        };

        fetchMessages();
    }, [messages]);

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

        if (currentUser) {
            const profaneWordCount = countProfaneWords(newMessage);
            console.log(profaneWordCount)
            if (profaneWordCount > 2) {
                addToBlacklist(currentUser.username, 'Excessive profanity');
                alert('Excessive profanity detected. Your message cannot be sent.');
                return;
            }

            const censoredMessage = censorMessage(newMessage);

            axios.post('http://localhost:3001/api/messages', { text: censoredMessage, userId: currentUser.id, username })
                .then(response => {
                    const newMessageObj: Message = response.data;
                    setMessages(prevMessages => [...prevMessages, newMessageObj]);
                    setNewMessage('');
                })
                .catch(error => {
                    console.error('Error sending message:', error);
                });
        } else {
            alert('You need to log in first.');
        }
    };

    const addToBlacklist = (username: string, reason: string) => {
        axios.post('http://localhost:3001/api/blacklist', { username, reason })
            .then(response => {
                console.log(`User ${username} added to the blacklist for reason: ${reason}`);
            })
            .catch(error => {
                console.error('Error adding user to blacklist:', error);
            });
    };
    let profaneCount = 0;
    const countProfaneWords = (message: string): number => {
        const words = message.split(/\s+/);
        let profaneCount = 0;

        words.forEach(word => {
            if (filter.isProfane(word) || rusFilter.has(word.toLowerCase())) {
                console.log(`Processing word: ${word}`);
                console.log(`Profane word detected: ${word}`);
                profaneCount++;
                console.log(`Total profane word count: ${profaneCount}`);
            }
        });

        return profaneCount;
    };


    const handleDeleteMessage = async (messageId: string) => {
        console.log("Deleting message with ID:", messageId);
        const authToken = localStorage.getItem('authToken');

        try {
            await axios.delete(`http://localhost:3001/api/messages/${messageId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });

            setMessages(prevMessages => prevMessages.filter(message => message._id !== messageId));
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message. Please try again later.');
        }
    };

    const censorMessage = (message: string) => {
        return message
            .split(/\s+/)
            .map(word => {
                if (filter.isProfane(word)) {
                    return '*'.repeat(word.length);
                } else if (rusFilter.has(word.toLowerCase())) {
                    return '*'.repeat(word.length);
                } else {
                    return word;
                }
            })
            .join(' ');
    };


    return (
        <div>
            <Typography variant="body1" paragraph>
                Welcome, {currentUser.username} ({currentUser.id})!
            </Typography>

            <ul className={classes.messageList}>
                {messages.map(message => (
                    <li key={message._id} className={classes.messageItem}>
                        <strong>{message.username}: </strong>
                        {message.text}
                        {message.username === username && (
                            <Button variant="outlined" color="error" onClick={() => handleDeleteMessage(message.text)}>
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
