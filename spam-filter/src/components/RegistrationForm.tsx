import React, { useState } from 'react';

interface RegistrationFormProps {
    onRegister: (userData: { name: string; nickname: string; password: string; }) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister }) => {
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [ password, setPassword] = useState('');

    const handleRegister = () => {
        if (name.trim() && nickname.trim()) {
            onRegister({ name, nickname, password });
        } else {
            alert('Please enter a valid name and nickname.');
        }
    };

    return (
        <div>
            <h2>Registration</h2>
            <label>
                Name:
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <br />
            <label>
                Nickname:
                <input type="text" value={nickname} onChange={(e) => setNickname(e.target.value)} />
            </label>
            <br />
            <button onClick={handleRegister}>Register</button>
        </div>
    );
};

export default RegistrationForm;
