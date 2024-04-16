import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Button } from '@mui/material';

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

    const handleUnblockUser = async (userId: number) => {
        try {
            await axios.delete(`http://localhost:3001/api/blocked-users/${userId}`);
            setBlockedUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
        } catch (error) {
            console.error('Error unblocking user:', error);
        }
    };

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                Blocked Users
            </Typography>
            {blockedUsers.length > 0 ? (
                <ul>
                    {blockedUsers.map(user => (
                        <li key={user.id}>
                            {user.name}
                            <Button variant="contained" color="primary" onClick={() => handleUnblockUser(user.id)}>
                                Unblock
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : (
                <Typography variant="body1">No users are currently blocked.</Typography>
            )}
        </Container>
    );
};

export default BlockedUsersPage;
