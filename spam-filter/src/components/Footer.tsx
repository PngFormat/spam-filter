// Footer.js
import React from 'react';
import { AppBar, Toolbar, Typography, Link } from '@mui/material';

const Footer = () => {
    return (
        <AppBar  position="static" color="primary" style={{marginTop: 200}}>
            <Toolbar>
                <div style={{ flex: 1 }}>
                    <Typography variant="body2" color="inherit">
                        © 2024 Chat App. All rights reserved.
                    </Typography>
                </div>
                <div>
                    <Link href="#" color="inherit" style={{ marginRight: 16 }}>
                        Privacy Policy
                    </Link>
                    <Link href="#" color="inherit">
                        Terms of Service
                    </Link>
                </div>
            </Toolbar>
        </AppBar>
    );
};

export default Footer;
