import React, { useRef, useEffect } from 'react';
import { Chat, Message, User } from '../../types';
import { PaperAirplaneIcon, PlusCircleIcon } from '../icons/Icons';

interface ChatViewProps {
  chat: Chat;
  onSendMessage: (text: string, type: Message['type']) => void;
  currentUser: User;
  users: User[];
}

const ChatView: React.FC<ChatViewProps> = ({ chat, onSendMessage, currentUser, users }) => {
  const [message, setMessage] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [chat.messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim(), 'text');
      setMessage('');
    }
  };
  
  const getUserById = (id: string) => users.find(u => u.id === id);
  
  const renderMessageContent = (message: Message) => {
    switch(message.type) {
        case 'image':
            return <img src={message.text} alt="Shared content" className="max-w-xs rounded-lg cursor-pointer" onClick={() => window.open(message.text, '_blank')} />;
        case 'link':
            return <a href={message.text} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline hover:text-blue-700 break-all">{message.text}</a>;
        case 'text':
        default:
            return <p className="whitespace-pre-wrap break-words">{message.text}</p>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-6 space-y-6">
        {chat.messages.map((msg, index) => {
          const sender = getUserById(msg.senderId);
          const isCurrentUser = msg.senderId === currentUser.id;
          const showAvatar = index === 0 || chat.messages[index - 1].senderId !== msg.senderId;
          
          return (
            <div key={msg.id} className={`flex items-start gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
               <div className="w-10 h-10">
                 {showAvatar && sender && (
                   <img src={sender.avatar} alt={sender.name} className="w-10 h-10 rounded-full" />
                 )}
               </div>
               <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                  {showAvatar && sender && (
                    <div className={`flex items-baseline gap-2 mb-1 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                      <span className="font-bold">{sender.name}</span>
                      <span className="text-xs text-gray-500">{msg.timestamp}</span>
                    </div>
                  )}
                  <div className={`px-4 py-2 rounded-2xl max-w-md ${isCurrentUser ? 'bg-pink-500 text-white rounded-br-none' : 'bg-pink-100 text-gray-800 rounded-bl-none'}`}>
                      {renderMessageContent(msg)}
                  </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-6 py-4 bg-white/70 border-t border-pink-200">
        <form onSubmit={handleSend} className="relative">
          <button type="button" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-pink-500">
            <PlusCircleIcon />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Message ${chat.name}`}
            className="w-full bg-pink-100 rounded-lg py-3 pl-12 pr-12 border-transparent focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-pink-500 hover:text-pink-600 disabled:text-gray-400" disabled={!message.trim()}>
            <PaperAirplaneIcon />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatView;