import React, { useEffect, useState } from 'react';
import { Button, TextField, Typography, Snackbar, Alert } from '@mui/material';
import styles from '../styles/Home.module.css';
import axios from 'axios';
import Filter from 'bad-words';
import rusBadWords from '../rusbadwords.json';
import Stickers from './Stickers';

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
    const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState<string>('');
    const [rateLimitMessage, setRateLimitMessage] = useState<string>('');
    const [openSnackbar, setOpenSnackbar] = useState<boolean>(false);

    const filter = new Filter();
    const rusFilter = new Set(rusBadWords);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/messages');
                setMessages(response.data);
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

    const handleStickerSelect = (sticker: string) => {
        setSelectedSticker(sticker);
    };

    const handleSendMessage = async () => {
        if (!newMessage.trim() && !selectedSticker) {
            console.warn('Message text is empty and no sticker is selected');
            return;
        }

        let messageToSend = newMessage.trim();

        if (selectedSticker) {
            messageToSend += ` ${selectedSticker}`;
        }

        if (currentUser) {
            const profaneWordCount = countProfaneWords(messageToSend);

            if (profaneWordCount > 2) {
                addToBlacklist(currentUser.username, 'Excessive profanity');
                alert('Excessive profanity detected. Your message cannot be sent.');
                return;
            }

            const censoredMessage = censorMessage(messageToSend);

            try {
                const response = await axios.post('http://localhost:3001/api/messages', {
                    text: censoredMessage,
                    userId: currentUser.id,
                    username,
                });

                setMessages(prevMessages => [...prevMessages, response.data]);
                setNewMessage('');
                setSelectedSticker(null);
            } catch (error) {
                // @ts-ignore
                if (error.response && error.response.status === 429) {
                    // @ts-ignore
                    setRateLimitMessage(error.response.data.message);
                    setOpenSnackbar(true);
                } else {
                    console.error('Error sending message:', error);
                }
            }
        } else {
            alert('You need to log in first.');
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
    };

    const countProfaneWords = (message: string): number => {
        const words = message.split(/\s+/);
        let profaneCount = 0;

        words.forEach(word => {
            if (filter.isProfane(word) || rusFilter.has(word.toLowerCase())) {
                profaneCount++;
            }
        });

        return profaneCount;
    };

    const censorMessage = (message: string) => {
        return message
            .split(/\s+/)
            .map(word => (filter.isProfane(word) || rusFilter.has(word.toLowerCase()) ? '*'.repeat(word.length) : word))
            .join(' ');
    };

    const handleDeleteMessage = async (messageId: string) => {
        const authToken = localStorage.getItem('authToken');

        try {
            await axios.delete(`http://localhost:3001/api/messages/${messageId}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

            setMessages(prevMessages => prevMessages.filter(message => message._id !== messageId));
        } catch (error) {
            console.error('Error deleting message:', error);
            alert('Failed to delete message. Please try again later.');
        }
    };

    const addToBlacklist = async (username: string, reason: string) => {
        try {
            const authToken = localStorage.getItem('authToken');
            await axios.post('http://localhost:3001/api/blacklist', { username, reason }, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });
        } catch (error) {
            console.error('Error adding user to blacklist:', error);
        }
    };

    return (
        <div className={classes.chatContainer} style={{ backgroundColor: '#f3f3f3', color: '#333' }}>
            <Typography variant="body1" paragraph className={classes.welcomeMessage}>
                Welcome, {currentUser.username} ({currentUser.id})!
            </Typography>

            <ul className={classes.messageList}>
                {messages.map(message => (
                    <li
                        key={message._id}
                        className={`${classes.messageItem} ${message.username === username ? classes.ownMessage : ''}`}
                    >
                        <div className={classes.messageContent}>
                            <strong>{message.username}: </strong>
                            {message.text.trim().startsWith('/static/media/') ? (
                                <>
                                    <img
                                        src={message.text}
                                        alt="Sticker"
                                        className={classes.stickerImage}
                                        width="30"
                                        height="30"
                                    />
                                    <p>{message.text.split(' ').slice(1).join(' ')}</p>
                                </>
                            ) : (
                                message.text.split(' ').map((part, index) => (
                                    part.startsWith('/static/media/') ? (
                                        <img
                                            key={index}
                                            src={part}
                                            alt="Sticker"
                                            className={classes.stickerImage}
                                            width="30"
                                            height="30"
                                        />
                                    ) : (
                                        <React.Fragment key={index}>
                                            {part.split(':').map((subPart, subIndex) => (
                                                subIndex % 2 === 0 ? (
                                                    <span key={subIndex}>{subPart}</span>
                                                ) : (
                                                    <img
                                                        key={subIndex}
                                                        src={`smiley-${subPart}.png`}
                                                        alt={`Smiley ${subPart}`}
                                                    />
                                                )
                                            ))}
                                        </React.Fragment>
                                    )
                                ))
                            )}
                        </div>
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
                    style={{ backgroundColor: '#fff', color: '#333' }}
                />
                <Stickers onStickerSelect={handleStickerSelect} />
                <Button variant="contained" color="primary" onClick={handleSendMessage} className={classes.sendButton} style={{ backgroundColor: '#2196F3' }}>
                    Send
                </Button>
            </div>

            <Snackbar open={openSnackbar} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: '100%' }}>
                    {rateLimitMessage}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default Chat;
