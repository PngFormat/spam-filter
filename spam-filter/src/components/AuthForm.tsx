import React, { useState } from 'react';

interface LoginFormProps {
    onLogin?: (token: string,username:string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [userData, setUserData] = useState({
        username: '',
        password: ''
    });
    const [error, setError] = useState<string>('');

    // Новое состояние для имени пользователя
    const [username, setUsername] = useState<string>('');

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUserData({ ...userData, [name]: value });

        // Обновляем состояние имени пользователя при изменении
        if (name === 'username') {
            setUsername(value);
        }
    };

    const handleLogin = async () => {
        let authToken;

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
            authToken = data.authToken;

            // Вызываем onLogin с токеном и именем пользователя
            if (onLogin) {
                onLogin(authToken, username);
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
