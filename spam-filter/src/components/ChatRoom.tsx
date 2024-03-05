import React, {useState, useEffect, useCallback} from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import RegistrationForm from "./RegistrationForm";

interface Message {
    id: number;
    text: string;
    username: string;
}

interface User {
    id: number;
    name: string;
    nickname: string;
}


const ChatRoom: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>('');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const socket = io('http://localhost:3001', { transports: ['websocket'] });

    useEffect(() => {
        loginUser();
    }, []);

    useEffect(() => {
        axios.get('http://localhost:3001/api/messages')
            .then(response => setMessages(response.data))
            .catch(error => console.error('Error fetching initial messages:', error));

        socket.on('newMessage', (newMessage) => {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        return () => {
            socket.disconnect();
        };
    }, [socket]);

    const loginUser = async () => {
        try {
            const users = await fetch('/api/users').then((response) => response.json());
            console.log('List of users:', users);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const handleRegister = useCallback((userData: { username: string; email: string; password: string }) => {
        axios
            .post('http://localhost:3001/api/users', userData)
            .then((response) => {
                const newUser = response.data;
                setCurrentUser(newUser);
            })
            .catch((error) => {
                console.error('Error creating user:', error);
            });
    }, [setCurrentUser]);



    const handleSendMessage = () => {
        if (!newMessage.trim()) {
            console.warn('Message text is empty');
            return;
        }

        if (currentUser) {
            axios.post('http://localhost:3001/api/messages', { text: newMessage, username: currentUser.nickname })
                .then(response => {
                    setMessages((prevMessages) => [...prevMessages, response.data]);
                    setNewMessage('');
                })
                .catch(error => {
                    console.error('Error sending message:', error);
                    alert('Failed to send message. Please try again later.');
                });
        } else {
            alert('You need to log in first.');
        }
    };




    const sendMessage = (message: any) => {
        socket.emit('sendMessage', { text: message });
    };


    socket.on('newMessage', (message) => {
        console.log('New message:', message);

    });





    return (
        <div>
            <h2>Chat Room</h2>

            {!currentUser && (
                <div>
                    <RegistrationForm
                        onRegister={(userData) => handleRegister({
                            username: userData.name,
                            email: userData.nickname,
                            password: userData.password
                        })}
                    />
                </div>
            )}

            {currentUser && (
                <div>
                    <p>Welcome, {currentUser.name} ({currentUser.nickname})!</p>

                    <ul>
                        {messages.map(message => (
                            <li key={message.id}>
                                <strong>{message.username}: </strong>
                                {message.text}
                            </li>
                        ))}
                    </ul>

                    <div>
                        <input
                            type="text"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                        />
                        <button onClick={handleSendMessage}>Send</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatRoom;