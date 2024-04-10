import React from 'react';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';



const UserList: React.FC<{ users: any[] }> = ({ users }) => {
    return (
        <Paper elevation={3} style={{ padding: 16, marginTop: 16 }}>
            <Typography variant="h6" gutterBottom>
                Registered Users
            </Typography>
            <List>
                {users.map((user) => (
                    <ListItem key={user._id}>
                        <ListItemText primary={`Nickname ${user.username}`} secondary={`@Email ${user.email}`} />
                        <span>{user._id}</span>
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default UserList;
