import React, { useState, useEffect } from 'react';
import axios from 'axios';

const InfoPage: React.FC = () => {
    const [userMessageCounts, setUserMessageCounts] = useState<{ username: string; messageCount: number; }[]>([]);

    useEffect(() => {
        const fetchUserMessageCounts = async () => {
            try {
                const response = await axios.get<{ [key: string]: number }>('http://localhost:3001/api/user/message-count');
                const data = response.data;
                console.log(response.data)
                // Преобразуем объект в массив объектов
                const userMessageCountsArray = Object.keys(data).map(username => ({
                    username,
                    messageCount: data[username],
                }));

                // Установим полученные данные в состояние
                setUserMessageCounts(userMessageCountsArray);
            } catch (error) {
                console.error('Error fetching user message counts:', error);
            }
        };

        fetchUserMessageCounts();
    }, []);

    return (
        <div>
            <h1>User Message Info</h1>
            <ul>
                {userMessageCounts.length > 0 ? (
                    userMessageCounts.map(user => (
                        <li key={user.username}>
                            <strong>Username:</strong> {user.username}<br />
                            <strong>Message Count:</strong> {user.messageCount}
                        </li>
                    ))
                ) : (
                    <li>No user data available</li>
                )}
            </ul>
        </div>
    );
};

export default InfoPage;
