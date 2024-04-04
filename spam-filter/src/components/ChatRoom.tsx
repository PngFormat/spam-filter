import React, {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import RegistrationForm from "./RegistrationForm";
import {Button,Paper, TextField, Theme, Typography} from "@mui/material";
import styles from '../styles/Home.module.css'
import LoginForm from "./AuthForm";



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
    const [showRegistrationForm, setShowRegistrationForm] = useState<boolean>(false);
    const [showLoginForm, setShowLoginForm] = useState<boolean>(false);

    useEffect(() => {
        loginUser();
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            axios.get('http://localhost:3001/api/user', {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            }).then(response => {
                setCurrentUser(response.data.user);
            }).catch(error => {
                console.error('Error fetching user data:', error);
            });
        }
    }, []);

    const loginUser = async () => {
        try {
            const users = await fetch('/api/users').then((response) => response.json());
            console.log('List of users:', users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleRegister = useCallback((userData: { username: string; email: string; password: string }) => {
        setShowRegistrationForm(false)
        axios.post('http://localhost:3001/api/register', userData)
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

    const handleLoginSuccess = useCallback((authToken: string) => {
        setShowLoginForm(false);
        console.log(authToken)
        localStorage.setItem('authToken', authToken);
        axios.get('http://localhost:3001/api/user', {
            headers: {
                Authorization: `Bearer ${authToken}`

            }
        }).then(response => {
            const newUser = response.data.username;
            setCurrentUser(newUser);
            const { name } = newUser || {};
            setName(name);
        }).catch(error => {
            console.error('Error fetching user data:', error);
        });
    }, [setCurrentUser]);

    const handleShowRegistrationForm = () => {
        setShowRegistrationForm(true);
        setShowLoginForm(false);
    };

    const handleShowLoginForm = () => {
        setShowLoginForm(true);
        setShowRegistrationForm(false);
    };

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
            {!currentUser && !showRegistrationForm && (
                <div>
                    <Button onClick={handleShowRegistrationForm}>Sign up</Button>
                    <Button onClick={handleShowLoginForm}>Sign in</Button>
                </div>
            )}

            {showRegistrationForm && (
                <RegistrationForm
                    onRegister={(userData) => handleRegister({
                        username: userData.name,
                        email: userData.nickname,
                        password: userData.password
                    })}
                />
            )}
            {showLoginForm && (
                <LoginForm onLogin={handleLoginSuccess} />
            )}

            {currentUser && localStorage.getItem('authToken') && (
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