import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, CssBaseline, Typography } from '@mui/material';
import Header from '../components/Header';
import UserList from '../components/UserList';

const UserPage = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/users');
                setUsers(response.data);
                console.log(response)
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, []);

    return (
        <>
            <CssBaseline />
            <Header />
            <Container maxWidth="lg" style={{ marginTop: 20 }}>
                <Typography variant="h4" gutterBottom>
                    Registered Users
                </Typography>
                {users.length > 0 ? (
                    <UserList users={users} />
                ) : (
                    <Typography variant="body1">No registered users found.</Typography>
                )}
            </Container>
        </>
    );
};

export default UserPage;