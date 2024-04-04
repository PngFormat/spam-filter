import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

interface LoginFormProps {
    onLogin: (userData: { username: string; password: string }) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
    const [userData, setUserData] = useState({
        username: '',
        password: ''
    });
    const history = useHistory();

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setUserData({ ...userData, [name]: value });
    };

    const handleLogin = () => {
        onLogin(userData);
        history.push('/');
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
