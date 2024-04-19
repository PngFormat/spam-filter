import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Button, CircularProgress } from '@mui/material';
import styles from '../styles/BlackList.module.css';

interface User {
    _id: number;
    username: string;
    nickname: string;
}

const BlockedUsersPage = () => {
    const [blockedUsers, setBlockedUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchBlockedUsers = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/blacklist');
                setBlockedUsers(response.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching blocked users:', error);
            }
        };

        fetchBlockedUsers();
    }, []);

    const handleUnblockUser = async (userId: number) => {
        try {
            await axios.delete(`http://localhost:3001/api/blacklist/${userId}`);
            const updatedBlockedUsers = blockedUsers.filter(user => user._id !== userId);
            setBlockedUsers(updatedBlockedUsers);
        } catch (error) {
            console.error('Error unblocking user:', error);
        }
    };

    return (
        <Container maxWidth="lg" className={styles.root}>
            <Typography variant="h4" gutterBottom className={styles.title}>
                Blocked Users
            </Typography>
            {loading ? (
                <CircularProgress />
            ) : blockedUsers.length > 0 ? (
                <ul className={styles.userList}>
                    {blockedUsers.map(user => (
                        <li key={user._id} className={styles.userItem}>
                            <div className={styles.userInfo}>
                                <Typography variant="h6" className={styles.username}>Username:</Typography>
                                <Typography variant="body1" className={styles.usernameValue}>{user.username}</Typography>
                                <Typography variant="h6" className={styles.userId}>User ID:</Typography>
                                <Typography variant="body1" className={styles.userIdValue}>{user._id}</Typography>
                            </div>
                            <Button
                                variant="contained"
                                color="primary"
                                className={styles.unblockButton}
                                onClick={() => handleUnblockUser(user._id)}
                            >
                                Unblock
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : (
                <Typography variant="body1" className={styles.noUsersMessage}>No users are currently blocked.</Typography>
            )}
        </Container>
    );
};

export default BlockedUsersPage;
