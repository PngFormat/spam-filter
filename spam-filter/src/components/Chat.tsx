import React, { useEffect, useState } from 'react';
import { Button, TextField, Typography } from '@mui/material';
import styles from '../styles/Home.module.css';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import Filter from 'bad-words';
import rusBadWords from '../rusbadwords.json';
import ukrBadWords from '../ukrainianbadwords.json';
import Stickers from "./Stickers";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

interface Sticker {
    url: string;
    name: string;
}

const messageRateLimit = {
    count: 0,
    lastMessageTime: 0,
};

const Chat: React.FC<ChatProps> = ({ currentUser, username }) => {
    const classes = styles;
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
    const [newMessage, setNewMessage] = useState<string>('');
    const filter = new Filter();
    const rusFilter = new Set(rusBadWords);
    const ukrFilter = new Set(ukrBadWords);

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
    }, []);

    useEffect(() => {
        return () => {
            localStorage.setItem('chatMessages', JSON.stringify(messages));
        };
    }, [messages]);

    const handleStickerSelect = (stickerUrl: string) => {
        setSelectedSticker(stickerUrl);
    };

    const isValidImageUrl = (url: string) => {
        return /\.(jpeg|jpg|gif|png)$/.test(url);
    };

    const addToBlacklist = async (username: string, reason: string) => {
        try {
            const authToken = localStorage.getItem('authToken');
            await axios.post('http://localhost:3001/api/blacklist', { username, reason }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            console.log(`User ${username} added to blacklist for reason: ${reason}`);
        } catch (error) {
            console.error('Error adding user to blacklist:', error);
        }
    };

    const checkMessageLimit = () => {
        const currentTime = Date.now();
        const timeDifference = currentTime - messageRateLimit.lastMessageTime;

        if (messageRateLimit.count >= 3 && timeDifference < 10000) {
            const timeLeft = Math.ceil((10000 - timeDifference) / 1000);
            toast.error(`Please wait ${timeLeft} seconds before sending another message`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            return true;
        } else if (timeDifference >= 10000) {
            messageRateLimit.count = 1;
            messageRateLimit.lastMessageTime = currentTime;
            return false;
        } else {
            messageRateLimit.count += 1;
            messageRateLimit.lastMessageTime = currentTime;
            return false;
        }
    };

    const handleSendMessage = () => {
        if (checkMessageLimit()) {
            return;
        }

        if (!newMessage && !selectedSticker) {
            console.warn('Message text is empty and no sticker is selected');
            return;
        }
        const words = newMessage.trim().split(/\s+/);
        let messageToSend = '';

        if (selectedSticker) {
            messageToSend += ` ${selectedSticker}`;
        }
        messageToSend = words.join(' ');

        if (currentUser) {
            const profaneWordCount = countProfaneWords(messageToSend);
            if (profaneWordCount > 2) {
                addToBlacklist(currentUser.username, 'Excessive profanity');
                toast.error('Excessive profanity detected. Your message cannot be sent.', {
                    position: "top-right",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                });
                return;
            }
            const censoredMessage = censorMessage(messageToSend);

            axios.post('http://localhost:3001/api/messages', { text: censoredMessage, userId: currentUser.id, username })
                .then(response => {
                    const newMessageObj: Message = response.data;
                    setMessages(prevMessages => [...prevMessages, newMessageObj]);
                    setNewMessage('');
                    setSelectedSticker(null);
                })
                .catch(error => {
                    if (error.response && error.response.status === 403) {
                        toast.error('You are blocked and cannot send messages.', {
                            position: "top-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
                    } else {
                        console.error('Error sending message:', error);
                    }
                });
        } else {
            toast.error('You need to log in first.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    const countProfaneWords = (message: string): number => {
        const words = message.split(/\s+/);
        let profaneCount = 0;

        words.forEach(word => {
            if (filter.isProfane(word) || rusFilter.has(word.toLowerCase()) || ukrFilter.has(word.toLowerCase())) {
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
            toast.error('Failed to delete message. Please try again later.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    };

    const censorMessage = (message: string) => {
        return message
            .split(/\s+/)
            .map(word => {
                if (filter.isProfane(word) || rusFilter.has(word.toLowerCase()) || ukrFilter.has(word.toLowerCase())) {
                    addToBlacklist(currentUser.username, 'inappropriate words');
                    return '*'.repeat(word.length);
                } else {
                    return word;
                }
            })
            .join(' ');
    };

    return (
        <div className={classes.chatContainer} style={{ backgroundColor: '#f3f3f3', color: '#333' }}>
            <Typography variant="body1" paragraph className={classes.welcomeMessage}>
                Welcome, {currentUser.username} ({currentUser.id})!
            </Typography>

            <ToastContainer />

            <ul className={classes.messageList}>
                {messages.map(message => (
                    <li key={message._id} className={`${classes.messageItem} ${message.username === username ? classes.ownMessage : ''}`}>
                        <div className={classes.messageContent}>
                            <strong>{message.username}: </strong>
                            {message.text.trim().startsWith('/static/media/') ? (
                                <img src={message.text} alt="Sticker" className={classes.stickerImage} width="30" height="30" />
                            ) : (
                                message.text.split('').map((part, index) => (
                                    part.startsWith('/static/media/') ? (
                                        <img key={index} src={part} alt="Sticker" className={classes.stickerImage} width="30" height="30" />
                                    ) : (
                                        <React.Fragment key={index}>
                                            {part.split(':').map((subPart, subIndex) => (
                                                subIndex % 2 === 0 ? (
                                                    <span key={subIndex}>{subPart}</span>
                                                ) : (
                                                    <img key={subIndex} src={`smiley-${subPart}.png`} alt={`Smiley ${subPart}`} />
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
        </div>
    );
};

export default Chat;