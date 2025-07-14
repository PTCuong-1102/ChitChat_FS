import React from 'react';
import { Chat, User } from '../../types';
import { PlusIcon } from '../icons/Icons';
import UserInfo from './UserInfo';

interface SidebarProps {
  chats: Chat[];
  onSelectChat: (chatId: string) => void;
  activeChatId: string | undefined | null;
  onShowFriends: () => void;
  openCreateGroupModal: () => void;
  currentUser: User;
  onSignOut: () => void;
  onOpenProfile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    chats, onSelectChat, activeChatId, onShowFriends, openCreateGroupModal,
    currentUser, onSignOut, onOpenProfile
}) => {
  return (
    <aside className="w-80 bg-pink-50 flex-shrink-0 flex flex-col justify-between">
      <div className="flex-grow p-3 overflow-y-auto">
         <div className="p-3 mb-2 flex items-center justify-between">
             <button 
                  onClick={onShowFriends}
                  className="w-full text-left p-2 rounded-md hover:bg-pink-200 text-lg font-semibold text-pink-600"
              >
                  Friends
              </button>
              <button onClick={openCreateGroupModal} className="text-gray-400 hover:text-pink-600 ml-2 p-1">
                <PlusIcon />
              </button>
         </div>
        
        <div className="space-y-1">
          {chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === activeChatId}
              onSelect={() => onSelectChat(chat.id)}
              currentUser={currentUser}
            />
          ))}
        </div>
      </div>
      <UserInfo user={currentUser} onSignOut={onSignOut} onOpenProfile={onOpenProfile} />
    </aside>
  );
};

interface ChatItemProps {
    chat: Chat;
    isActive: boolean;
    onSelect: () => void;
    currentUser: User;
}

const ChatItem: React.FC<ChatItemProps> = ({ chat, isActive, onSelect, currentUser }) => {
  let avatarUrl: string | undefined;
  let displayName: string;
  let details: string | undefined;

  if (chat.isBotChat) {
    const bot = chat.participants.find(p => p.isBot);
    avatarUrl = bot?.avatar;
    displayName = bot?.name ?? chat.name;
    details = chat.lastMessagePreview;
  } else if (chat.type === 'dm') {
    const otherUser = chat.participants.find(p => p.id !== currentUser.id);
    avatarUrl = otherUser?.avatar;
    displayName = otherUser?.name ?? chat.name;
    details = chat.lastMessagePreview ?? otherUser?.activity ?? '';
  } else { // group chat
    avatarUrl = chat.avatar;
    displayName = chat.name;
    details = chat.lastMessagePreview ?? `${chat.participants.length} members`;
  }

  return (
    <button
      onClick={onSelect}
      className={`w-full flex items-center p-2 rounded-lg text-left transition-colors ${
        isActive ? 'bg-pink-300 text-white' : 'hover:bg-pink-200'
      }`}
    >
      <img
        src={avatarUrl ?? 'https://i.imgur.com/8c1zJ1s.png'} // Fallback avatar
        alt={displayName}
        className="w-10 h-10 rounded-full mr-3 object-cover"
      />
      <div className="flex-grow overflow-hidden">
        <p className="font-semibold truncate">{displayName}</p>
        <p className={`text-sm truncate ${isActive ? 'text-gray-100' : 'text-gray-500'}`}>
          {details}
        </p>
      </div>
    </button>
  );
};

export default Sidebar;