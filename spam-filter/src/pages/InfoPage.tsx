import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/Info.module.css';

const InfoPage: React.FC = () => {
    const [userMessageCounts, setUserMessageCounts] = useState<{ username: string; messageCount: number; }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserMessageCounts = async () => {
            try {
                const response = await axios.get<{ [key: string]: number }>('http://localhost:3001/api/user/message-count');
                const data = response.data;
                console.log(response.data);
                const userMessageCountsArray = Object.keys(data).map(username => ({
                    username,
                    messageCount: data[username],
                }));

                setUserMessageCounts(userMessageCountsArray);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching user message counts:', error);
                setIsLoading(false);
            }
        };

        fetchUserMessageCounts();
    }, []);

    return (
        <div className={styles["info-page-container"]}>
            <h1>User Message Info</h1>
            {isLoading ? (
                <div className={styles["loader"]}>Loading...</div>
            ) : (
                <ul className={styles["user-list"]}>
                    {userMessageCounts.length > 0 ? (
                        userMessageCounts.map(user => (
                            <li key={user.username} className={styles["user-item"]}>
                                <strong>Username:</strong> {user.username}<br />
                                <strong>Message Count:</strong> {user.messageCount}
                            </li>
                        ))
                    ) : (
                        <li className={styles["no-data"]}>No user data available</li>
                        )}
                </ul>
            )}
        </div>
    );
}

export default InfoPage;
