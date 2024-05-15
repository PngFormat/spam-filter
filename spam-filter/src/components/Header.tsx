import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <AppBar position="static">
            <Toolbar>

                <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Typography variant="h6">Chat App</Typography>
                </Link>
                <Link to="/users" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Button color="inherit">Users</Button>
                </Link>
                <Link to="/blocked-users" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Button color="inherit">BlackList</Button>
                </Link>
                <Link to="/chat" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Button color="inherit">ChatROOM</Button>
                </Link>
                <Link to="/info" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Button color="inherit">Statistics</Button>
                </Link>
            </Toolbar>
        </AppBar>
    );
};

export default Header;
