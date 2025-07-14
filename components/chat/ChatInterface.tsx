import React, { useState, useCallback, useEffect } from 'react';
import ServerList from './ServerList';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatView from './ChatView';
import FriendsView from './FriendsView';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';
import { AI_BOTS } from '../../constants';
import { Chat, User, Message } from '../../types';
import CreateGroupModal from '../modals/CreateGroupModal';
import { UserProfileModal } from '../modals/UserProfileModal';
import FriendRequestsModal from '../modals/FriendRequestsModal';
import ConfigureAIBotModal from '../modals/ConfigureAIBotModal';
import ChatManagementPanel from './ChatManagementPanel';

type View = 'friends' | 'chat';
type Modal = 'createGroup' | 'userProfile' | 'friendRequests' | 'configureAIBot' | null;
type FriendshipStatus = 'friends' | 'request_sent' | 'not_friends';

const ChatInterface: React.FC<{ onSignOut: () => void }> = ({ onSignOut }) => {
  const { user: currentUser, logout } = useAuth();
  const { chats, activeChat, setActiveChat, sendMessage, createRoom, loadChats } = useChat();
  const [activeServerId, setActiveServerId] = useState<string>('home');
  const [view, setView] = useState<View>('friends');
  const [modal, setModal] = useState<Modal>(null);
  const [bots, setBots] = useState<User[]>(AI_BOTS);
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isManagementPanelOpen, setManagementPanelOpen] = useState(false);
  

  useEffect(() => {
    if (currentUser) {
      loadChats();
    }
  }, [currentUser, loadChats]);

  const handleSelectChat = (chat: Chat) => {
    setActiveChat(chat);
    setView('chat');
    setManagementPanelOpen(false);
  };

  const handleSelectServer = (serverId: string) => {
    setActiveServerId(serverId);
    setManagementPanelOpen(false);
    if (serverId === 'home') {
      setView('friends');
      setActiveChat(null);
      setSearchQuery('');
    } else {
      const botChat = chats.find(c => c.isBotChat && c.participants.some(p => p.id === serverId));
      if (botChat) {
        setActiveChat(botChat);
        setView('chat');
      }
    }
  };
  
  const handleShowFriends = () => {
      setActiveServerId('home');
      setActiveChat(null);
      setView('friends');
      setSearchQuery('');
      setManagementPanelOpen(false);
  }

  const handleSendMessage = useCallback((text: string, type: Message['type'] = 'text') => {
    if (!activeChat) return;
    sendMessage(activeChat.id, text, type);
  }, [activeChat, sendMessage]);

  const handleConfigureBot = (botName: string, model: string, provider: string, apiKey: string) => {
    // This functionality should be handled by the backend
  };

  const handleUpdateProfile = (updatedUser: User) => {
    // This functionality should be handled by the backend
  };

  
  const handleGroupAction = (chatId: string, action: 'removeUser' | 'changeRole' | 'leave', payload: { userId?: string, newRole?: 'admin' | 'member' }) => {
    // This functionality should be handled by the backend
  };


  return (
    <div className="h-screen w-screen flex text-gray-800">
      <ServerList 
        bots={bots}
        activeServerId={activeServerId}
        onSelectServer={handleSelectServer}
        onAddBot={() => setModal('configureAIBot')}
      />
      {activeServerId === 'home' && currentUser && (
        <Sidebar
          chats={chats.filter(c => !c.isBotChat)}
          onSelectChat={handleSelectChat}
          activeChatId={activeChat?.id || null}
          onShowFriends={handleShowFriends}
          openCreateGroupModal={() => setModal('createGroup')}
          currentUser={currentUser}
          onSignOut={logout}
          onOpenProfile={() => setModal('userProfile')}
        />
      )}
      <div className="flex flex-col flex-grow bg-white relative overflow-hidden">
        <Header 
            activeChat={activeChat} 
            view={view} 
            onShowFriendRequests={() => setModal('friendRequests')}
            searchQuery={searchQuery}
            onSearchChange={(e) => setSearchQuery(e.target.value)}
            onToggleManagementPanel={() => setManagementPanelOpen(prev => !prev)}
        />
        <main className="flex-grow overflow-y-auto bg-white/70">
          {view === 'friends' && activeServerId === 'home' && currentUser && (
            <FriendsView 
                searchQuery={searchQuery}
                currentUser={currentUser}
            />
          )}
          {view === 'chat' && activeChat && currentUser && (
            <ChatView
              chat={activeChat}
              onSendMessage={handleSendMessage}
              currentUser={currentUser}
              users={[]}
            />
          )}
        </main>
        {isManagementPanelOpen && activeChat && (
            <ChatManagementPanel 
                chat={activeChat}
                currentUser={currentUser}
                users={[]}
                onClose={() => setManagementPanelOpen(false)}
                onGroupAction={handleGroupAction}
            />
        )}
      </div>
      {modal === 'createGroup' && <CreateGroupModal onClose={() => setModal(null)} users={[]} />}
      {modal === 'userProfile' && currentUser && (
        <UserProfileModal 
          onClose={() => setModal(null)} 
          user={currentUser} 
          onUpdateProfile={handleUpdateProfile}
        />
      )}
      {modal === 'friendRequests' && <FriendRequestsModal onClose={() => setModal(null)} />}
      {modal === 'configureAIBot' && <ConfigureAIBotModal onClose={() => setModal(null)} onConfigure={handleConfigureBot} />}
    </div>
  );
};

export default ChatInterface;