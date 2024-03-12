import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography } from '@mui/material';

interface User {
    id: number;
    name: string;
}
const BlockedUsersPage = () => {
    const [blockedUsers, setBlockedUsers] = useState<User[]>([]);

    useEffect(() => {
        const fetchBlockedUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/blocked-users');
                setBlockedUsers(response.data);
            } catch (error) {
                console.error('Error fetching blocked users:', error);
            }
        };

        fetchBlockedUsers();
    }, []);

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                Blocked Users
            </Typography>
            {blockedUsers.length > 0 ? (
                <ul>
                    {blockedUsers.map(user => (
                        <li key={user.id}>{user.name}</li>
                    ))}
                </ul>
            ) : (
                <Typography variant="body1">No users are currently blocked.</Typography>
            )}
        </Container>
    );
};

export default BlockedUsersPage;
