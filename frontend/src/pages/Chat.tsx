import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useChatStore, ChatRoom, Message } from '../store/chatStore';
import { useSocket } from '../hooks/useSocket';
import { Send, User as UserIcon, AlertCircle } from 'lucide-react';

export const Chat = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { chats, messages, activeChat, typingUsers, setChats, setMessages, addMessage, setActiveChat, updateChatLastMessage } = useChatStore();
  const { joinRoom, emitTyping } = useSocket();
  const [text, setText] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [chatError, setChatError] = useState('');
  const [autoCreateStarted, setAutoCreateStarted] = useState(false);
  const [searchParams] = useSearchParams();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch chats list
  useQuery({
    queryKey: ['chatsList'],
    queryFn: async () => {
      const res = await api.get('/chat');
      setChats(res.data.data);
      return res.data.data;
    }
  });

  // Fetch messages when activeChat changes
  useQuery({
    queryKey: ['chatMessages', activeChat?._id],
    queryFn: async () => {
      const res = await api.get(`/chat/${activeChat?._id}/messages`);
      setMessages(res.data.data);
      return res.data.data;
    },
    enabled: !!activeChat?._id
  });

  const createChatMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/chat/room', {
        recipientEmail: recipientEmail.trim().toLowerCase()
      });
      return res.data.data;
    },
    onSuccess: (data: ChatRoom) => {
      setChats([data, ...chats.filter((chat) => chat._id !== data._id)]);
      setActiveChat(data);
      setChatError('');
      queryClient.invalidateQueries({ queryKey: ['chatsList'] });
    },
    onError: (error: any) => {
      setChatError(error?.message || 'Unable to start chat.');
    }
  });

  // Send message mutation
  const sendMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/chat/message', {
        chatId: activeChat?._id,
        content: text,
        contentType: 'text'
      });
      return res.data.data;
    },
    onSuccess: (data: Message) => {
      addMessage(data);
      updateChatLastMessage(data);
      setText('');
      emitTyping(activeChat!._id, false);
    }
  });

  // Scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join Socket.io room when active chat changes
  useEffect(() => {
    if (activeChat?._id) {
      joinRoom(activeChat._id);
    }
  }, [activeChat?._id]);

  useEffect(() => {
    const recipient = searchParams.get('recipient')?.trim().toLowerCase();
    if (recipient) {
      setRecipientEmail(recipient);
    }
  }, [searchParams]);

  useEffect(() => {
    if (recipientEmail && !autoCreateStarted && !activeChat) {
      setAutoCreateStarted(true);
      createChatMutation.mutate();
    }
  }, [recipientEmail, autoCreateStarted, activeChat, createChatMutation]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeChat) return;
    sendMutation.mutate();
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    if (activeChat) {
      emitTyping(activeChat._id, e.target.value.length > 0);
    }
  };

  const getRecipientName = (chat: ChatRoom) => {
    const peer = chat.participants.find(p => p._id !== user?.id);
    return peer?.email || 'System User';
  };

  const activePeer = activeChat?.participants.find(p => p._id !== user?.id);
  const isPeerTyping = activePeer ? typingUsers[activePeer._id] : false;

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden font-sans">
      
      {/* Chats Threads List */}
      <div className="flex w-full flex-col md:w-4/12 bg-white rounded-3xl border border-slate-200 p-5 dark:bg-dark-900 dark:border-dark-800">
        <div className="mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Messages</h3>
          <p className="mt-2 text-xs text-slate-500 dark:text-dark-400">Start a new chat by entering the recipient&apos;s email.</p>
        </div>

        <div className="mb-4 space-y-2 rounded-3xl border border-slate-100 bg-slate-50 p-4 dark:border-dark-800 dark:bg-dark-950">
          <input
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="Recipient email"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-primary-500 dark:border-dark-700 dark:bg-dark-900 dark:text-white"
          />
          <button
            type="button"
            onClick={() => {
              setChatError('');
              createChatMutation.mutate();
            }}
            disabled={!recipientEmail.trim() || createChatMutation.isPending}
            className="w-full rounded-xl bg-primary-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {createChatMutation.isPending ? 'Starting chat...' : 'Start New Chat'}
          </button>
          {chatError && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-600">
              {chatError}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto space-y-2">
          {chats.map((chat) => (
            <div
              key={chat._id}
              onClick={() => setActiveChat(chat)}
              className={`
                cursor-pointer rounded-2xl border p-4 transition-all hover:scale-[1.01]
                ${activeChat?._id === chat._id
                  ? 'border-primary-500 bg-primary-500/5 dark:bg-primary-950/10'
                  : 'border-slate-100 bg-slate-50/50 hover:border-slate-200 dark:border-dark-800 dark:bg-dark-800/20'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-800 text-slate-650 dark:text-dark-350">
                  <UserIcon size={18} />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="truncate font-bold text-slate-800 dark:text-white text-sm">{getRecipientName(chat)}</h4>
                  <p className="truncate text-xs text-slate-500 dark:text-dark-400 mt-0.5">
                    {chat.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {chats.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">No active chat sessions found.</div>
          )}
        </div>
      </div>

      {/* Chat Messages Panel */}
      <div className="hidden flex-1 flex-col bg-white rounded-3xl border border-slate-200 dark:bg-dark-900 dark:border-dark-800 md:flex overflow-hidden">
        {activeChat ? (
          <div className="flex flex-col h-full">
            
            {/* Header info */}
            <div className="flex items-center gap-3 border-b border-slate-100 p-5 dark:border-dark-800/80">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 text-primary-650 dark:bg-primary-950/40 dark:text-primary-400">
                <UserIcon size={18} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">{getRecipientName(activeChat)}</h3>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
                  {activePeer?.role}
                </span>
              </div>
            </div>

            {/* Messages display stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3.5 bg-slate-50/30 dark:bg-dark-900/10">
              {messages.map((msg) => {
                const isMyMessage = msg.sender._id === user?.id;
                return (
                  <div 
                    key={msg._id} 
                    className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`
                      max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm
                      ${isMyMessage 
                        ? 'bg-primary-600 text-white rounded-tr-none' 
                        : 'bg-white border border-slate-100 text-slate-800 dark:bg-dark-800 dark:border-dark-750 dark:text-white rounded-tl-none'}
                    `}>
                      <p>{msg.content}</p>
                      <span className={`block text-[9px] mt-1 text-right ${isMyMessage ? 'text-primary-100' : 'text-slate-400'}`}>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {isPeerTyping && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-slate-100 bg-white px-4 py-2 text-xs text-slate-400 dark:bg-dark-800 dark:border-dark-750">
                    <span className="font-semibold">{getRecipientName(activeChat)}</span> is typing...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="border-t border-slate-100 p-4 dark:border-dark-800/80 flex gap-2">
              <input
                type="text"
                value={text}
                onChange={handleTyping}
                placeholder="Type a message..."
                className="flex-1 rounded-xl bg-slate-100 dark:bg-dark-800 border-none py-3 px-4 text-sm focus:outline-none placeholder-slate-400"
              />
              <button
                type="submit"
                disabled={!text.trim() || sendMutation.isPending}
                className="rounded-xl bg-primary-600 p-3 text-white shadow hover:bg-primary-500 disabled:opacity-50 transition-all"
              >
                <Send size={18} />
              </button>
            </form>

          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <AlertCircle size={40} className="mb-3 text-slate-350" />
            <p>Select a message thread to begin real-time chat.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Chat;
