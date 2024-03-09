// Header.js
import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6">Chat App</Typography>
                <Link to="/users" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Button color="inherit">Users</Button>
                </Link>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
