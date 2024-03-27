import React, {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import RegistrationForm from "./RegistrationForm";
import {Button,Paper, TextField, Theme, Typography} from "@mui/material";
import styles from '../styles/Home.module.css'



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
    const classes = styles;

    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [name, setName] = useState<string>('');
    const socket = io('http://localhost:3001', {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 3,
    });


    useEffect(() => {
        loginUser();
    }, []);

    // useEffect(() => {
    //     axios.get('http://localhost:3001/api/messages')
    //         .then(response => setMessages(response.data))
    //         .catch(error => console.error('Error fetching initial messages:', error));
    //
    //     socket.on('newMessage', (newMessage) => {
    //         setMessages((prevMessages) => [...prevMessages, newMessage]);
    //     });
    //
    //     return () => {
    //         socket.disconnect();
    //     };
    // }, [socket]);

    const loginUser = async () => {
        try {
            const users = await fetch('/api/users').then((response) => response.json());
            console.log('List of users:', users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };


    const handleRegister = useCallback((userData: { username: string; email: string; password: string }) => {
        axios
            .post('http://localhost:3001/api/register', userData)
            .then((response) => {
                const newUser = response.data.message;
                console.log('New user:', newUser);
                setCurrentUser(newUser);
                const { name } = newUser || {};
                setName(name);


                console.log(`Welcome, ${name}!`);
            })
            .catch((error) => {
                console.error('Error creating user:', error);
            });
    }, [setCurrentUser, setName]);




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
                .catch(error => {
                    console.error('Error sending message:', error);
                    alert('Failed to send message. Please try again later.');
                });
        } else {
            alert('You need to log in first.');
        }
    };






    return (
        <Paper className={classes.root} elevation={3}>
            <Typography variant="h5" className={classes.welcomeMessage}>
                Chat Room
            </Typography>

            {!currentUser && (
                <div>
                    <RegistrationForm
                        onRegister={(userData) => handleRegister({
                            username: userData.name,
                            email: userData.nickname,
                            password: userData.password
                        })}
                    />
                </div>
            )}

            {currentUser && (
                <div>
                    <Typography variant="body1" paragraph>
                        Welcome, {currentUser.id} ({currentUser.nickname})!
                    </Typography>

                    <ul className={classes.messageList}>
                        {messages.map((message) => (
                            <li key={message.id} className={classes.messageItem}>
                                <strong>{message.username}: </strong>
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
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <Button variant="contained" color="primary" onClick={handleSendMessage}>
                            Send
                        </Button>
                    </div>
                </div>
            )}
        </Paper>
    );
};

export default ChatRoom;