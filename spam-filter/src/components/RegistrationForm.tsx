
import React, { useState } from 'react';
import styles from '../styles/Registration.module.css';

interface RegistrationFormProps {
    onRegister?: (userData: { name: string; nickname: string; password: string; }) => void;
    onLogin?: (userData: { name: string; password: string; }) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onRegister }) => {
    const [name, setName] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');

    const handleRegister = () => {
        if (name.trim() && nickname.trim()) {
            if (onRegister) {
                onRegister({name, nickname, password});
            }
        } else {
            alert('Please enter a valid name and nickname.');
        }
    };

    const classes = styles;

    return (
        <div className={classes.formContainer}>
            <h2 className={classes.formHeader}>Registration</h2>
            <label className={classes.formLabel}>
                Name:
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className={classes.formInput}
                />
            </label>
            <label className={classes.formLabel}>
                Nickname:
                <input
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className={classes.formInput}
                />
            </label>
            <label className={classes.formLabel}>
                Password:
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={classes.formInput}
                />
            </label>
            <button onClick={handleRegister} className={classes.formButton}>
                Register
            </button>
        </div>
    );
};

export default RegistrationForm;
