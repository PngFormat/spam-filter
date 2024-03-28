import React, { useState } from 'react';

interface LoginFormProps {
    onLogin?: (token: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [userData, setUserData] = useState({
        username: '',
        password: ''
    });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                throw new Error('Authentication failed');
            }

            const data = await response.json();
            const authToken = data.authToken;


            if (onLogin) {
                onLogin(authToken);
            }
        } catch (error: any) {
            console.error('Authentication error:', (error as Error).message);
        }
    };

    return (
        <div>
            <label>
                username:
                <input
                    type="text"
                    name="nickname"
                    value={userData.username}
                    onChange={handleInputChange}
                />
            </label>
            <label>
                Password:
                <input
                    type="password"
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                />
            </label>
            <button onClick={handleLogin}>Login</button>
        </div>
    );
};

export default LoginForm;
