import React, {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import RegistrationForm from "./RegistrationForm";
import {Button,Paper, TextField, Theme, Typography} from "@mui/material";
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
    name: string;
    nickname: string;
}


const ChatRoom: React.FC = () => {
    const classes = styles;
    localStorage.removeItem('currentUser')
    localStorage.removeItem('authToken')
    const [currentUser, setCurrentUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('currentUser');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [name, setName] = useState<string>('');
    const [showRegistrationForm, setShowRegistrationForm] = useState<boolean>(false);
    const [showLoginForm, setShowLoginForm] = useState<boolean>(false);

    useEffect(() => {
        loginUser();
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            axios.get('http://localhost:3001/api/users', {
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
                localStorage.setItem('currentUser', JSON.stringify(newUser));
                localStorage.setItem('authToken', response.data.token);
                const { name } = newUser || {};
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
            const newUser: User = response.data.username;
            setCurrentUser(newUser);
            console.log('New user:', newUser);
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            const { name } = newUser;
            setName(username);
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