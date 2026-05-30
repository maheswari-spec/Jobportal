import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useChatStore, Message } from '../store/chatStore';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user } = useAuthStore();
  const { addMessage, updateChatLastMessage, setTyping } = useChatStore();

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    // Connect directly to backend socket in development using VITE_API_URL
    const backendUrl = (import.meta.env.VITE_API_URL as string) || window.location.origin;
    const socket = io(backendUrl, {
      path: '/socket.io',
      query: { userId: user.id },
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.IO Connected to Server');
    });

    socket.on('receive_message', (message: Message) => {
      addMessage(message);
      updateChatLastMessage(message);
    });

    socket.on('typing_status', (data: { roomId: string; userId: string; isTyping: boolean }) => {
      setTyping(data.userId, data.isTyping);
    });

    socket.on('notification', (data: any) => {
      console.log('Notification received:', data);
      // Dispatch browser custom event or trigger a state update in UI
      const event = new CustomEvent('socket_notification', { detail: data });
      window.dispatchEvent(event);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, addMessage, updateChatLastMessage, setTyping]);

  const joinRoom = (roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join_room', roomId);
    }
  };

  const emitTyping = (roomId: string, isTyping: boolean) => {
    if (socketRef.current && user) {
      socketRef.current.emit('typing', { roomId, userId: user.id, isTyping });
    }
  };

  return { socket: socketRef.current, joinRoom, emitTyping };
};

export default useSocket;
