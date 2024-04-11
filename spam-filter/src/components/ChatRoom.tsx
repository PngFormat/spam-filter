import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import RegistrationForm from "./RegistrationForm";
import { Button, Paper, TextField, Typography } from "@mui/material";
import styles from '../styles/Home.module.css'
import LoginForm from "./AuthForm";
import Chat from "./Chat";

interface Message {
    id: number;
    text: string;
    username: string;
}

interface User {
    id: number;
    username: string;
    nickname: string;
}

const ChatRoom: React.FC = () => {
    const classes = styles;

    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const [name, setName] = useState<string>('');

    const [showRegistrationForm, setShowRegistrationForm] = useState<boolean>(false);
    const [showLoginForm, setShowLoginForm] = useState<boolean>(false);

    useEffect(() => {
        const authToken = localStorage.getItem('authToken');
        if (authToken && !currentUser) {
            axios.get('http://localhost:3001/api/users', {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            }).then(response => {
                setCurrentUser(response.data);
                console.log('fetch' + response.data)
                setName(response.data.name);
            }).catch(error => {
                console.error('Error fetching user data:', error);
            });
        }
    }, [currentUser]);

    const handleRegister = useCallback((userData: { username: string; email: string; password: string }) => {
        setShowRegistrationForm(false)
        axios.post('http://localhost:3001/api/register', userData)
            .then((response) => {
                const newUser = response.data.user;
                setCurrentUser(newUser);
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                localStorage.setItem('authToken', response.data.token);
                setName(name);
            })
            .catch((error) => {
                console.error('Error creating user:', error);
            });
    }, [setCurrentUser, setName]);

    const handleLoginSuccess = useCallback((authToken: string, username: string) => {
        setShowLoginForm(false);
        localStorage.setItem('authToken', authToken);
        axios.get(`http://localhost:3001/api/user/${username}`, {
            headers: {
                Authorization: `Bearer ${authToken}`
            }
        }).then(response => {
            const newUser: User = response.data;
            setCurrentUser(newUser)
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            setName(response.data.username);
            localStorage.setItem('username', name);
        }).catch(error => {
            console.error('Error fetching user data:', error);
        });
    }, [setCurrentUser, setName]);

    const handleShowRegistrationForm = () => {
        setShowRegistrationForm(true);
        setShowLoginForm(false);
    };

    const handleShowLoginForm = () => {
        setShowLoginForm(true);
        setShowRegistrationForm(false);
    };

    const handleLogout = () => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        setCurrentUser(null);
        setName('');
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

            {currentUser && (
                <div>
                    <Chat currentUser={currentUser} username={name} />
                    <Button onClick={handleLogout}>Log out</Button>
                </div>
            )}
        </Paper>
    );
};

export default ChatRoom;
