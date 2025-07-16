import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Chat, Message } from '../types';
import { apiService } from '../services/apiService';
import { useAuth } from './AuthContext';
import { useFriends } from './FriendsContext';

interface ChatContextType {
  chats: Chat[];
  activeChat: Chat | null;
  isLoading: boolean;
  loadChats: () => Promise<void>;
  setActiveChat: (chat: Chat | null) => void;
  setChats: React.Dispatch<React.SetStateAction<Chat[]>>;
  sendMessage: (roomId: string, content: string, messageType?: 'text' | 'image' | 'link') => Promise<void>;
  createRoom: (name: string, type: 'dm' | 'group', participants: string[]) => Promise<void>;
  loadMessages: (roomId: string) => Promise<Message[]>;
  sendTypingIndicator: (roomId: string, isTyping: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token, isAuthenticated, user: currentUser } = useAuth();
  const { loadFriendRequests } = useFriends();
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('🔌 Supabase real-time connection established');
      // TODO: Implement Supabase real-time subscriptions for messages
    }
  }, [isAuthenticated, token]);

  const handleSocketMessage = (data: any) => {
    switch (data.type) {
      case 'new_message':
        setChats(prevChats =>
          prevChats.map(chat =>
            chat.id === data.message.room_id
              ? { ...chat, messages: [...(chat.messages || []), data.message] }
              : chat
          )
        );
        if (activeChat && activeChat.id === data.message.room_id) {
            setActiveChat(prev => prev ? { ...prev, messages: [...(prev.messages || []), data.message] } : null);
        }
        break;
      case 'typing_indicator':
        // Handle typing indicator logic here
        break;
      case 'friend_request':
        // Reload friend requests when a new one is received
        loadFriendRequests();
        break;
      case 'friend_request_accepted':
        // Reload friend requests and friends list
        loadFriendRequests();
        break;
      default:
        break;
    }
  };

  const loadChats = async () => {
    try {
      setIsLoading(true);
      const rooms = await apiService.getRooms();
      setChats(rooms);
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (roomId: string): Promise<Message[]> => {
    try {
      const messages = await apiService.getRoomMessages(roomId);
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === roomId ? { ...chat, messages } : chat
        )
      );
      return messages;
    } catch (error) {
      console.error('Failed to load messages:', error);
      return [];
    }
  };

  const sendMessage = async (roomId: string, content: string, messageType: 'text' | 'image' | 'link' = 'text') => {
    const chat = chats.find(c => c.id === roomId);
    if (!chat) {
      console.error('Chat not found for room:', roomId);
      return;
    }

    // Create the user message
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser?.id || 'current-user',
      text: content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: messageType
    };

    // Add the user message to the chat immediately for UI responsiveness
    const updatedChat = {
      ...chat,
      messages: [...(chat.messages || []), userMessage]
    };

    // Update the chat in the chats list
    setChats(prevChats => 
      prevChats.map(c => c.id === roomId ? updatedChat : c)
    );

    // Update active chat if it's the current one
    if (activeChat && activeChat.id === roomId) {
      setActiveChat(updatedChat);
    }

    try {
      if (chat.isBotChat) {
        // For bot chats, generate AI response
        try {
          const aiResponse = await apiService.generateAiResponse(content);
          
          // Add AI response after a delay
          setTimeout(() => {
            const botMessage: Message = {
              id: `msg-${Date.now()}-bot`,
              senderId: chat.participants.find(p => p.isBot)?.id || 'bot',
              text: aiResponse,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              type: 'text'
            };

            // Add bot message to the chat
            const chatWithBotResponse = {
              ...updatedChat,
              messages: [...updatedChat.messages, botMessage]
            };

            setChats(prevChats => 
              prevChats.map(c => c.id === roomId ? chatWithBotResponse : c)
            );

            if (activeChat && activeChat.id === roomId) {
              setActiveChat(chatWithBotResponse);
            }
          }, 1000);
        } catch (aiError) {
          console.error('Failed to generate AI response:', aiError);
        }
      } else {
        // For regular chats, send to backend
        await apiService.sendMessage(roomId, { text: content, type: messageType });
        // Reload messages after sending to get the latest from backend
        loadMessages(roomId);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Remove the message from UI if sending failed
      setChats(prevChats => 
        prevChats.map(c => c.id === roomId ? chat : c)
      );
      if (activeChat && activeChat.id === roomId) {
        setActiveChat(chat);
      }
    }
  };

  const sendTypingIndicator = (roomId: string, isTyping: boolean) => {
    // TODO: Implement typing indicator with Supabase real-time
    console.log('Typing indicator:', { roomId, isTyping });
  };

  const createRoom = async (name: string, type: 'dm' | 'group', participants: string[]) => {
    try {
      const newRoom = await apiService.createRoom({ name, type, participants });
      setChats(prevChats => [...prevChats, newRoom]);
    } catch (error) {
      console.error('Failed to create room:', error);
      throw error;
    }
  };

  const handleSetActiveChat = (chat: Chat | null) => {
    setActiveChat(chat);
    if (chat) {
      if (!chat.messages || chat.messages.length === 0) {
        loadMessages(chat.id);
      }
    }
  };

  const value = {
    chats,
    activeChat,
    isLoading,
    loadChats,
    setActiveChat: handleSetActiveChat,
    setChats,
    sendMessage,
    createRoom,
    loadMessages,
    sendTypingIndicator,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
