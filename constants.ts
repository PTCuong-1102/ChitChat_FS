import { User, Chat, Message } from './types';

export const CURRENT_USER: User = {
    id: 'user-0',
    name: 'spencercamp',
    username: 'spencercamp',
    avatar: 'https://picsum.photos/seed/spencer/48/48',
    email: 'spencer@camp.com',
    status: 'online',
    dob: '1995-08-15',
    socials: {
        facebook: 'https://facebook.com/spencercamp',
        linkedin: 'https://linkedin.com/in/spencercamp',
        zalo: '',
    }
};

export const USERS: User[] = [
    CURRENT_USER,
    { id: 'user-1', name: 'Nelly', username: 'nelly_music', avatar: 'https://picsum.photos/seed/nelly/48/48', email: 'nelly@music.com', status: 'online', activity: 'Listening to Spotify' },
    { id: 'user-2', name: 'Peppe', username: 'peppe_p', avatar: 'https://picsum.photos/seed/peppe/48/48', email: 'peppe@p.com', status: 'online' },
    { id: 'user-3', name: 'Phibi', username: 'phibi_gta', avatar: 'https://picsum.photos/seed/phibi/48/48', email: 'phibi@gta.com', status: 'online', activity: 'Playing GTA' },
    { id: 'user-4', name: 'Cap', username: 'cap_user', avatar: 'https://picsum.photos/seed/cap/48/48', email: 'cap@user.com', status: 'away' },
    { id: 'user-5', name: 'Wumpus', username: 'wumpus_mc', avatar: 'https://picsum.photos/seed/wumpus/48/48', email: 'wumpus@mc.com', status: 'online', activity: 'Streaming Minecraft' },
    { id: 'user-6', name: 'Locke', username: 'locke_hike', avatar: 'https://picsum.photos/seed/locke/48/48', email: 'locke@hike.com', status: 'online', activity: "I'm on a hike trip today!" },
    { id: 'user-7', name: 'Clyde', username: 'clyde_au', avatar: 'https://picsum.photos/seed/clyde/48/48', email: 'clyde@au.com', status: 'online', activity: 'Playing Among Us' },
    { id: 'user-gemini', name: 'Gemini Bot', username: 'gemini-bot', avatar: 'https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d63ea73de9292a71b4a3.gif', email: '', status: 'online', isBot: true, model: 'gemini-1.5-flash', provider: 'gemini' },
];

export const AI_BOTS: User[] = USERS.filter(u => u.isBot && u.id === 'user-gemini');

const MESSAGES: { [key: string]: Message[] } = {
    'chat-1': [
        { id: 'msg-1-1', senderId: 'user-1', text: 'Hiii', timestamp: '02:50 SA', type: 'text' },
        { id: 'msg-1-2', senderId: 'user-0', text: 'Hey, Nelly.', timestamp: '07:48 SA', type: 'text' },
        { id: 'msg-1-3', senderId: 'user-0', text: 'Happy birthday to u', timestamp: '07:50 SA', type: 'text' },
        { id: 'msg-1-4', senderId: 'user-1', text: 'https://picsum.photos/id/10/300/200', timestamp: '07:51 SA', type: 'image' },
        { id: 'msg-1-5', senderId: 'user-0', text: 'Cool pic! Check this out: https://www.google.com', timestamp: '07:52 SA', type: 'link' },

    ],
    'chat-2': [
        { id: 'msg-2-1', senderId: 'user-2', text: 'Hi, how are you today...', timestamp: '09:15 SA', type: 'text' }
    ],
    'chat-gemini': [
        { id: 'msg-8-1', senderId: 'user-gemini', text: 'Hello! I am Gemini. How can I help you today?', timestamp: '08:00 SA', type: 'text' }
    ],
    'chat-group-1': [
        { id: 'msg-g1-1', senderId: 'user-1', text: 'Welcome to the group!', timestamp: '10:00 SA', type: 'text'},
        { id: 'msg-g1-2', senderId: 'user-6', text: 'https://picsum.photos/id/20/300/200', timestamp: '10:01 SA', type: 'image'},
    ]
};

export const CHATS: Chat[] = [
    { id: 'chat-1', type: 'dm', name: 'Nelly', participants: [USERS[0], USERS[1]], messages: MESSAGES['chat-1'], lastMessagePreview: 'You: Happy birthday to u' },
    { id: 'chat-2', type: 'dm', name: 'Peppe', participants: [USERS[0], USERS[2]], messages: MESSAGES['chat-2'], lastMessagePreview: 'Hi, how are you today...' },
    { id: 'chat-3', type: 'dm', name: 'Phibi', participants: [USERS[0], USERS[3]], messages: [], lastMessagePreview: 'Playing GTA' },
    { id: 'chat-4', type: 'dm', name: 'Cap', participants: [USERS[0], USERS[4]], messages: [], lastMessagePreview: 'Hi, how are you today...' },
    { id: 'chat-5', type: 'dm', name: 'Wumpus', participants: [USERS[0], USERS[5]], messages: [], lastMessagePreview: 'Streaming Minecraft' },
    { id: 'chat-6', type: 'dm', name: 'Locke', participants: [USERS[0], USERS[6]], messages: [], lastMessagePreview: "I'm on a hike trip today!" },
    { id: 'chat-7', type: 'dm', name: 'Clyde', participants: [USERS[0], USERS[7]], messages: [], lastMessagePreview: 'Playing Among Us' },
    { id: 'chat-gemini', type: 'dm', name: 'Gemini Bot', participants: [USERS[0], USERS[8]], messages: MESSAGES['chat-gemini'], lastMessagePreview: 'Hello! How can I help?', isBotChat: true },
    { 
      id: 'chat-group-1', 
      type: 'group', 
      name: 'Group ??????', 
      participants: [USERS[0], USERS[1], USERS[6]], 
      messages: MESSAGES['chat-group-1'], 
      avatar: 'https://picsum.photos/seed/group1/48/48',
      creatorId: 'user-0',
      roles: {
          'user-0': 'admin',
          'user-1': 'member',
          'user-6': 'member',
      }
    },
];
