import React from 'react';
import { User } from '../../types';
import { CogIcon, MicrophoneIcon, LogoutIcon } from '../icons/Icons';

interface UserInfoProps {
  user: User;
  onSignOut: () => void;
  onOpenProfile: () => void;
}

const UserInfo: React.FC<UserInfoProps> = ({ user, onSignOut, onOpenProfile }) => {
  return (
    <div className="flex-shrink-0 flex items-center justify-between h-20 bg-pink-200 px-4">
      <div className="flex items-center cursor-pointer" onClick={onOpenProfile}>
        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
        <div className="ml-3">
          <p className="font-semibold text-gray-800">{user.name}</p>
          <p className="text-sm text-gray-600">#{user.username}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button className="text-gray-600 hover:text-pink-600">
          <MicrophoneIcon />
        </button>
        <button onClick={onOpenProfile} className="text-gray-600 hover:text-pink-600">
          <CogIcon />
        </button>
        <button onClick={onSignOut} className="text-gray-600 hover:text-red-500">
            <LogoutIcon />
        </button>
      </div>
    </div>
  );
};

export default UserInfo;