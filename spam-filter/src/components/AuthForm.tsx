import React, { useState } from 'react';

interface LoginFormProps {
    onLogin: (userData: { username: string; password: string }, token?: string) => void;
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
            console.log('Sending login request with user data:', userData);

            const response = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            console.log('Response status:', response.status);

            const data = await response.json();
            console.log('Response data:', data);

            const authToken = data.authToken;
            console.log('Received authToken:', authToken);

            if (onLogin) {
                console.log('Calling onLogin handler with authToken:', authToken);
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
                    name="username"
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
