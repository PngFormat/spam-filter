import React from 'react';
import { List, ListItem, ListItemText, Paper, Typography } from '@mui/material';

const UserList: React.FC<{ users: any[] }> = ({ users }) => {
    return (
        <Paper elevation={3} style={{ padding: 16, marginTop: 16 }}>
            <Typography variant="h6" gutterBottom>
                Registered Users
            </Typography>
            <List>
                {users.map((user: { id: React.Key | null | undefined; name: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; nickname: any; }) => (
                    <ListItem key={user.id}>
                        <ListItemText primary={user.name} secondary={`@${user.nickname}`} />
                    </ListItem>
                ))}
            </List>
        </Paper>
    );
};

export default UserList;
