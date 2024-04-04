import React, { useState } from 'react';

interface LoginFormProps {
    onLogin?: (token: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [userData, setUserData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState<string>('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleLogin = async () => {
        let authToken;

        try {
            // console.log('User Data:', userData);
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
            authToken = data.authToken;

            if (onLogin) {
                onLogin(authToken);
            }
        } catch (error) {
            console.error('Authentication error:', (error as Error).message);
            setError('Authentication failed. Please check your credentials.');
        }
    };

    return (
        <div>
            <label>
                Username:
                <input
                    type="text"
                    name="username"
                    value={userData.username}
                    onChange={handleInputChange}
                />
            </label>
            <br />
            <label>
                Password:
                <input
                    type="password"
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                />
            </label>
            <br />
            <button onClick={handleLogin}>Login</button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default LoginForm;
