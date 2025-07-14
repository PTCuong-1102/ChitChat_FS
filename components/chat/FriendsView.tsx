import React, { useState } from 'react';
import { User } from '../../types';
import { useFriends } from '../../contexts/FriendsContext';

type FriendshipStatus = 'friends' | 'request_sent' | 'not_friends';

interface FriendsViewProps {
  searchQuery: string;
  currentUser: User;
}

const FriendsView: React.FC<FriendsViewProps> = ({ 
    searchQuery, currentUser 
}) => {
  const [activeTab, setActiveTab] = useState('online');
  const [addFriendQuery, setAddFriendQuery] = useState('');
  const [addFriendSearchResult, setAddFriendSearchResult] = useState<{ user: User; status: string } | 'not_found' | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { friends, findUser, sendFriendRequest } = useFriends();

  const filteredBySearch = friends.filter(user => 
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const onlineUsers = filteredBySearch.filter(u => u.status);
  const allUsers = filteredBySearch;

  const usersToDisplay = activeTab === 'online' ? onlineUsers : allUsers;

  const handleSearchFriend = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setAddFriendSearchResult(null);
      return;
    }

    try {
      setIsSearching(true);
      const result = await findUser(searchTerm.trim());
      if (result) {
        setAddFriendSearchResult(result);
      } else {
        setAddFriendSearchResult('not_found');
      }
    } catch (error) {
      console.error('Failed to search for friend:', error);
      setAddFriendSearchResult('not_found');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFriend = async (email: string) => {
    try {
      await sendFriendRequest(email);
      // Update the search result to show request sent
      if (addFriendSearchResult && addFriendSearchResult !== 'not_found') {
        setAddFriendSearchResult({
          ...addFriendSearchResult,
          status: 'request_sent'
        });
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
    }
  };

  return (
    <div className="p-6 h-full">
      <div className="flex border-b border-pink-200 mb-4">
        <TabButton isActive={activeTab === 'online'} onClick={() => setActiveTab('online')}>
          Online
        </TabButton>
        <TabButton isActive={activeTab === 'all'} onClick={() => setActiveTab('all')}>
          All
        </TabButton>
         <TabButton isActive={activeTab === 'add'} onClick={() => setActiveTab('add')}>
          Add Friend
        </TabButton>
      </div>

      {activeTab === 'add' ? (
        <AddFriendView 
            query={addFriendQuery}
            setQuery={setAddFriendQuery}
            searchResult={addFriendSearchResult}
            onSearch={handleSearchFriend}
            onAddFriend={handleAddFriend}
            currentUser={currentUser}
            isSearching={isSearching}
        />
      ) : (
        <div>
            <h3 className="text-sm font-bold uppercase text-gray-500 mb-2">{activeTab} — {usersToDisplay.length}</h3>
            <div className="space-y-2">
                {usersToDisplay.map(user => <UserRow key={user.id} user={user} />)}
            </div>
        </div>
      )}
    </div>
  );
};

interface AddFriendViewProps {
    query: string;
    setQuery: (query: string) => void;
    searchResult: { user: User; status: string } | 'not_found' | null;
    onSearch: (searchTerm: string) => void;
    onAddFriend: (email: string) => void;
    currentUser: User;
    isSearching: boolean;
}

const AddFriendView: React.FC<AddFriendViewProps> = ({ query, setQuery, searchResult, onSearch, onAddFriend, currentUser, isSearching }) => {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    }

    return (
        <div className="p-4">
            <h3 className="text-lg font-bold uppercase text-gray-700 mb-2">Add Friend</h3>
            <p className="text-sm text-gray-600 mb-4">Enter the exact username or email address to find a user.</p>
            <form onSubmit={handleSubmit} className="flex items-center bg-pink-100 p-2 rounded-lg gap-2">
                <input 
                    type="text" 
                    value={query} 
                    onChange={(e) => {
                        setQuery(e.target.value);
                        // Clear search result when user modifies the query
                        if (searchResult) {
                            setAddFriendSearchResult(null);
                        }
                    }} 
                    placeholder="username or email@example.com"
                    className="flex-grow bg-transparent focus:outline-none placeholder-gray-500 p-2"
                    disabled={isSearching}
                />
                <button 
                    type="submit" 
                    className="bg-pink-500 text-white font-semibold px-4 py-2 rounded-md hover:bg-pink-600 transition-colors disabled:bg-gray-400 flex items-center gap-2" 
                    disabled={!query.trim() || isSearching}
                >
                    {isSearching ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Searching...
                        </>
                    ) : (
                        'Search User'
                    )}
                </button>
            </form>
            <div className="mt-6">
                {searchResult === 'not_found' && (
                     <div className="text-red-500 text-center p-4 bg-red-50 rounded-lg border border-red-200">
                        <p className="font-bold">User Not Found</p>
                        <p>No user found with that username or email address. Please check the spelling and try again.</p>
                    </div>
                )}
                {searchResult && searchResult !== 'not_found' && (
                    <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-700">User Found:</p>
                        <div className="p-4 border border-pink-200 rounded-lg bg-pink-50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <img src={searchResult.user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(searchResult.user.full_name || searchResult.user.user_name)}&background=pink&color=fff`} alt={searchResult.user.full_name} className="w-12 h-12 rounded-full" />
                                    <div className="ml-4">
                                        <p className="font-bold text-lg">{searchResult.user.full_name || searchResult.user.user_name}</p>
                                        <p className="text-sm text-gray-500">@{searchResult.user.user_name}</p>
                                        <p className="text-sm text-gray-500">{searchResult.user.email}</p>
                                    </div>
                                </div>
                                <AddFriendButton 
                                    targetUser={searchResult.user} 
                                    currentUser={currentUser} 
                                    status={searchResult.status as FriendshipStatus}
                                    onAddFriend={(email) => onAddFriend(email)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

const AddFriendButton: React.FC<{targetUser: User, currentUser: User, status: FriendshipStatus | string, onAddFriend: (email: string) => void}> = ({ targetUser, currentUser, status, onAddFriend }) => {
    if (targetUser.id === currentUser.id) return null;
    
    const baseClasses = "px-4 py-2 rounded-md font-semibold transition-colors";
    
    switch (status) {
        case 'friends':
            return <button disabled className={`${baseClasses} bg-gray-300 text-gray-600 cursor-not-allowed`}>Already Friends</button>;
        case 'request_sent':
            return <button disabled className={`${baseClasses} bg-gray-300 text-gray-600 cursor-not-allowed`}>Request Sent</button>;
        case 'request_received':
            return <button disabled className={`${baseClasses} bg-blue-300 text-blue-700 cursor-not-allowed`}>Sent You a Request</button>;
        case 'not_friends':
        default:
            return <button onClick={() => onAddFriend(targetUser.email)} className={`${baseClasses} bg-pink-500 text-white hover:bg-pink-600`}>Send Friend Request</button>;
    }
};


const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 font-semibold text-lg ${isActive ? 'text-pink-500 border-b-2 border-pink-500' : 'text-gray-500'}`}
  >
    {children}
  </button>
);

const UserRow: React.FC<{ user: User }> = ({ user }) => {
  const avatar = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.user_name)}&background=pink&color=fff`;
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-pink-100">
      <div className="flex items-center">
        <div className="relative">
          <img src={avatar} alt={user.full_name || user.user_name} className="w-10 h-10 rounded-full" />
          <span className={`absolute bottom-0 right-0 block h-3 w-3 rounded-full border-2 border-white ${user.status ? 'bg-green-500' : 'bg-gray-400'}`}></span>
        </div>
        <div className="ml-4">
          <p className="font-bold">{user.full_name || user.user_name}</p>
          <p className="text-sm text-gray-600">@{user.user_name}</p>
        </div>
      </div>
      <div className="flex space-x-2">
          <button className="p-2 rounded-full bg-pink-200 text-gray-700 hover:bg-pink-300" title="Start Chat">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" /><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h1a2 2 0 002-2V9a2 2 0 00-2-2h-1z" /></svg>
          </button>
           <button className="p-2 rounded-full bg-pink-200 text-gray-700 hover:bg-pink-300" title="View Profile">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
          </button>
      </div>
    </div>
  );
};


export default FriendsView;