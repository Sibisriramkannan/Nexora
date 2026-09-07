import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';

const WebSocketContext = createContext();

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState([]);
    const socketRef = useRef(null);

    useEffect(() => {
        const token = localStorage.getItem('nexora_token');
        if (!token) return;

        const socket = io(process.env.REACT_APP_WS_URL || 'http://localhost:8080', {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('✅ WebSocket connected');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('❌ WebSocket disconnected');
            setIsConnected(false);
        });

        socket.on('metric_update', (data) => {
            setMessages(prev => [...prev, { type: 'metric', ...data }]);
        });

        socket.on('alert_triggered', (data) => {
            setMessages(prev => [...prev, { type: 'alert', ...data }]);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const joinRoom = (room) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('join', room);
        }
    };

    const leaveRoom = (room) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('leave', room);
        }
    };

    const value = {
        isConnected,
        messages,
        joinRoom,
        leaveRoom,
        socket: socketRef.current
    };

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
};