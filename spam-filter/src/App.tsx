import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from '../src/components/Header';
import Footer from '../src/components/Footer';
import ChatRoom from './components/ChatRoom';
import UserPage from './pages/UserPage';
import BlockedUsersPage from "../src/pages/BlockedUsersPage";

import LoginForm from "./components/AuthForm";

const App = () => {
    const handleLogin = (userData: { username: string; password: string }) => {

        console.log(userData);
    };

    return (
        <Router>
            <div>
                <Header />
                <Routes>
                    <Route path="/" element={<ChatRoom />} />
                    <Route path="/users" element={<UserPage />} />
                    <Route path="/blocked-users" element={<BlockedUsersPage />} />
                    <Route path="/login" element={<LoginForm />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    );
};

export default App;
