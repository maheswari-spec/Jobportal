import { create } from 'zustand';

export interface Participant {
  _id: string;
  email: string;
  role: string;
}

export interface Message {
  _id: string;
  chat: string;
  sender: Participant;
  content: string;
  contentType: 'text' | 'attachment' | 'resume_link';
  attachmentUrl?: string;
  createdAt: string;
}

export interface ChatRoom {
  _id: string;
  participants: Participant[];
  lastMessage?: Message;
  unreadCounts: Record<string, number>;
  updatedAt: string;
}

interface ChatState {
  chats: ChatRoom[];
  messages: Message[];
  activeChat: ChatRoom | null;
  typingUsers: Record<string, boolean>; // userId -> isTyping
  setChats: (chats: ChatRoom[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setActiveChat: (chat: ChatRoom | null) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  updateChatLastMessage: (message: Message) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  messages: [],
  activeChat: null,
  typingUsers: {},
  setChats: (chats) => set({ chats }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => {
    const alreadyExists = state.messages.some((existing) => existing._id === message._id);
    if (alreadyExists) {
      return state;
    }
    return { messages: [...state.messages, message] };
  }),
  setActiveChat: (chat) => set({ activeChat: chat, messages: [] }),
  setTyping: (userId, isTyping) => set((state) => ({
    typingUsers: { ...state.typingUsers, [userId]: isTyping }
  })),
  updateChatLastMessage: (message) => set((state) => {
    const updatedChats = state.chats.map((chat) => {
      if (chat._id === message.chat) {
        return { ...chat, lastMessage: message, updatedAt: message.createdAt };
      }
      return chat;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    return { chats: updatedChats };
  })
}));

export default useChatStore;
