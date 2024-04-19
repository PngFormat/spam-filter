import React from 'react';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import styles from '../styles/User.module.css'



const UserList: React.FC<{ users: any[] }> = ({ users }) => {
    return (
        <List className={styles.userList}>
            {users.map((user) => (
                <ListItem key={user.id} className={styles.userItem}>
                    <ListItemText
                        primary={
                            <Typography variant="h6" className={styles.username}>
                                {user.username}
                            </Typography>
                        }
                        secondary={
                            <>
                                <Typography variant="body1" className={styles.nickname}>
                                    {user.nickname}
                                </Typography>
                                <Typography variant="body2" className={styles.email}>
                                    {user.email}
                                </Typography>
                                <Typography variant="body2" className={styles.id}>
                                    ID: {user._id}
                                </Typography>
                            </>
                        }
                    />
                </ListItem>
            ))}
        </List>


    );
};

export default UserList;
