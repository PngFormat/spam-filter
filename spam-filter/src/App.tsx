import React from 'react';
import {BrowserRouter as Router, Routes, Route, Link} from 'react-router-dom';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import ChatRoom from './components/ChatRoom';
import UserPage from './pages/UserPage';
import BlockedUsersPage from "../src/pages/BlockedUsersPage";
import styles from '../src/styles/App.module.css';
import InfoPage from "./pages/InfoPage";
import {Button, Grid, Typography} from "@mui/material";
import Chat from '../src/img/Chat.png'
import Block from '../src/img/Block.png'
import Statistics from '../src/img/Statistics.png'

const App = () => {
    const handleLogin = (userData: { username: string; password: string }) => {
        console.log(userData);
    };

    return (
        <Router>
            <div className={styles.container}>
                <Header />

                <Routes>
                    <Route path="/chat" element={<ChatRoom />} />
                    <Route path="/users" element={<UserPage />} />
                    <Route path="/blocked-users" element={<BlockedUsersPage />} />
                    <Route path="/info" element={<InfoPage />} />

                    <Route path="/" element={<Home />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
};

const Home = () => {
    return (
        <div className={styles.home}>
            <h1>Welcome to Chat App</h1>
            <p>This is the home page of our chat application.</p>
            <p>You can navigate to other pages using the header navigation.</p>
            <Link to="/chat" style={{ textDecoration: 'none', color: 'inherit' }}>
                <Button variant="contained" color="primary">
                    Go to Chat Room
                </Button>
            </Link>
            <Grid container spacing={2}>
                <Grid item xs={10} sm={3} style={{ transform: 'rotate(-5deg)' }}>
                    <img src={Chat} alt="Image 1" style={{ width: '100%', height: 'auto' }} />
                    <Typography variant="subtitle1">Спілкуйся</Typography>
                </Grid>
                <Grid item xs={6} sm={3} style={{ transform: 'rotate(5deg)' }}>
                    <img src={Block} alt="Image 2" style={{ width: '100%', height: 'auto' }} />
                    <Typography variant="subtitle1">Не використовуй нецензурну лексику</Typography>
                </Grid>
                <Grid item xs={6} sm={3} style={{ transform: 'rotate(-3deg)' }}>
                    <img src={Statistics} alt="Image 3" style={{ width: '100%', height: 'auto' }} />
                    <Typography variant="subtitle1">Отримай статистику своїх повідомлень</Typography>
                </Grid>
            </Grid>
        </div>
    );
};

export default App;
