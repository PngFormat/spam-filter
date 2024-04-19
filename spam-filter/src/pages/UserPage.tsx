import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, CssBaseline, Typography } from '@mui/material';
import Header from '../components/Header';
import UserList from '../components/UserList';
import styles from '../styles/User.module.css'

const UserPage = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/users');
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    return (
        <>
            <CssBaseline />
            <Container maxWidth="lg" className={styles.container}>
                <Typography variant="h4" gutterBottom className={styles.title}>
                    Registered Users
                </Typography>
                {users.length > 0 ? (
                    <UserList users={users} />
                ) : (
                    <Typography variant="body1" className={styles.noUsers}>
                        No registered users found.
                    </Typography>
                )}
            </Container>
        </>
    );
};

export default UserPage;
