import { User, Chat, Message } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to transform backend user data to frontend format
function transformUser(backendUser: any): User {
  return {
    id: backendUser.id,
    full_name: backendUser.full_name,
    user_name: backendUser.user_name,
    avatar_url: backendUser.avatar_url,
    email: backendUser.email,
    status: backendUser.status,
    // Computed properties for backwards compatibility
    name: backendUser.full_name || backendUser.user_name,
    username: backendUser.user_name,
    avatar: backendUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(backendUser.user_name || 'User')}&background=pink&color=fff`,
  };
}

class ApiService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async register(userData: {
    userName: string;
    email: string;
    password: string;
    fullName: string;
  }): Promise<{ user: User; token: string }> {
    const response = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    this.token = response.token;
    localStorage.setItem('authToken', response.token);
    
    return {
      user: transformUser(response.user),
      token: response.token
    };
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    console.log('ApiService: Attempting login with:', { email: credentials.email });
    const response = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    console.log('ApiService: Login response received:', { userId: response.user?.id, hasToken: !!response.token });
    this.token = response.token;
    localStorage.setItem('authToken', response.token);
    console.log('ApiService: Authentication successful');
    
    return {
      user: transformUser(response.user),
      token: response.token
    };
  }

  async getProfile(): Promise<User> {
    const response = await this.request<any>('/auth/me');
    return transformUser(response);
  }

  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Chat methods
  async getRooms(): Promise<Chat[]> {
    return this.request<Chat[]>('/chat/rooms');
  }

  async createRoom(roomData: {
    name: string;
    type: 'dm' | 'group';
    participants: string[];
  }): Promise<Chat> {
    return this.request<Chat>('/chat/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  }

  async getRoomMessages(roomId: string): Promise<Message[]> {
    return this.request<Message[]>(`/chat/rooms/${roomId}/messages`);
  }

  async sendMessage(roomId: string, messageData: {
    text: string;
    type: 'text' | 'image' | 'link';
  }): Promise<Message> {
    return this.request<Message>(`/chat/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getRoomParticipants(roomId: string): Promise<User[]> {
    return this.request<User[]>(`/chat/rooms/${roomId}/participants`);
  }

  async addParticipant(roomId: string, participantData: {
    userId: string;
  }): Promise<void> {
    return this.request<void>(`/chat/rooms/${roomId}/participants`, {
      method: 'POST',
      body: JSON.stringify(participantData),
    });
  }

  async removeParticipant(roomId: string, participantId: string): Promise<void> {
    return this.request<void>(`/chat/rooms/${roomId}/participants/${participantId}`, {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string }> {
    return this.request<{ status: string; timestamp: string; service: string }>('/health');
  }

  // Friends methods
  async sendFriendRequest(friendEmail: string): Promise<void> {
    return this.request<void>('/friends/requests', {
      method: 'POST',
      body: JSON.stringify({ friendEmail }),
    });
  }

  async getFriendRequests(): Promise<any[]> {
    const response = await this.request<{ data: any[] }>('/friends/requests');
    return response.data;
  }

  async acceptFriendRequest(requestId: number): Promise<void> {
    return this.request<void>(`/friends/requests/${requestId}/accept`, {
      method: 'POST',
    });
  }

  async rejectFriendRequest(requestId: number): Promise<void> {
    return this.request<void>(`/friends/requests/${requestId}/reject`, {
      method: 'POST',
    });
  }

  async getFriends(): Promise<User[]> {
    const response = await this.request<{ data: User[] }>('/friends');
    return response.data.map(user => transformUser(user));
  }

  async searchUsers(query: string): Promise<{ user: User; status: string }[]> {
    const response = await this.request<{ data: { user: any; status: string }[] }>(`/friends/search?q=${encodeURIComponent(query)}`);
    return response.data.map(item => ({
      user: transformUser(item.user),
      status: item.status,
    }));
  }

  async findUser(query: string): Promise<{ user: User; status: string } | null> {
    try {
      const response = await this.request<{ data: { user: any; status: string } }>(`/friends/find?q=${encodeURIComponent(query)}`);
      return {
        user: transformUser(response.data.user),
        status: response.data.status,
      };
    } catch (error: any) {
      if (error.message?.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async removeFriend(friendId: string): Promise<void> {
    return this.request<void>(`/friends/${friendId}`, {
      method: 'DELETE',
    });
  }

  // Helper methods
  isAuthenticated(): boolean {
    return this.token !== null;
  }

  getToken(): string | null {
    return this.token;
  }
}

export const apiService = new ApiService();
