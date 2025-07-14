import React, { useState, useRef } from 'react';
import { User } from '../../types';

interface UserProfileModalProps {
  onClose: () => void;
  user: User;
  onUpdateProfile: (updatedUser: User) => void;
}

const InputField = ({ label, value, onChange, type = "text", placeholder = "" }: { label: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string, placeholder?: string }) => (
    <div>
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">{label}</label>
        <input 
            type={type} 
            value={value} 
            onChange={onChange}
            placeholder={placeholder}
            className="w-full text-base p-2 bg-pink-50 rounded-md border border-pink-200 focus:border-pink-500 focus:outline-none" 
        />
    </div>
);

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ onClose, user, onUpdateProfile }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    dob: user.dob || '',
    socials: {
      facebook: user.socials?.facebook || '',
      linkedin: user.socials?.linkedin || '',
      zalo: user.socials?.zalo || '',
    },
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({...prev, avatar: event.target?.result as string}));
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
      const { value } = e.target;
      setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'facebook' | 'linkedin' | 'zalo') => {
      const { value } = e.target;
      setFormData(prev => ({ ...prev, socials: { ...prev.socials, [field]: value } }));
  }

  const handleSave = () => {
    const updatedUser: User = {
        ...user,
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar,
        dob: formData.dob,
        socials: {
            facebook: formData.socials.facebook,
            linkedin: formData.socials.linkedin,
            zalo: formData.socials.zalo,
        }
    };
    onUpdateProfile(updatedUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 transform transition-all">
         <h2 className="text-2xl font-bold text-pink-500 mb-6">Settings</h2>
         
         <div className="space-y-6">
            {/* My Account Section */}
            <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">My Account</h3>
                <div className="flex items-center space-x-6">
                    <div className="relative">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                        <img 
                            src={formData.avatar} 
                            alt={formData.name} 
                            className="w-24 h-24 rounded-full ring-4 ring-pink-200 object-cover cursor-pointer" 
                            onClick={handleAvatarClick}
                        />
                         <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-grow space-y-4">
                        <InputField label="Full Name" value={formData.name} onChange={(e) => handleChange(e, 'name')} />
                        <InputField label="Email Address" value={formData.email} onChange={(e) => handleChange(e, 'email')} type="email" />
                        <button className="w-full text-left text-sm text-pink-600 hover:underline">Change Password</button>
                    </div>
                </div>
            </div>

            {/* Profile Information Section */}
            <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Date of Birth" value={formData.dob} onChange={(e) => handleChange(e, 'dob')} type="date" />
                    <InputField label="Facebook Profile" value={formData.socials.facebook} onChange={(e) => handleSocialChange(e, 'facebook')} placeholder="https://facebook.com/..." />
                    <InputField label="LinkedIn Profile" value={formData.socials.linkedin} onChange={(e) => handleSocialChange(e, 'linkedin')} placeholder="https://linkedin.com/in/..." />
                    <InputField label="Zalo Profile URL" value={formData.socials.zalo} onChange={(e) => handleSocialChange(e, 'zalo')} placeholder="https://zalo.me/..." />
                </div>
            </div>
         </div>
         

        <div className="mt-8 flex gap-3">
          <button 
            onClick={onClose} 
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave} 
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};