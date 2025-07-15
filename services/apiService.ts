import { User, Chat, Message } from '../types';

const API_BASE_URL = '/api';

class ApiService {
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async register(userData: {
    userName: string;
    email: string;
    password: string;
    fullName: string;
  }): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        username: userData.userName,
        email: userData.email,
        password: userData.password,
        fullName: userData.fullName
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Registration failed');
    }
    const result = await response.json();
    return { user: result.user, token: result.token };
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({ usernameOrEmail: credentials.email, password: credentials.password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Login failed');
    }
    const { token, user } = await response.json();
    localStorage.setItem('token', token);
    return { user, token };
  }

  async getProfile(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Get profile failed');
    }
    return response.json();
  }

  async logout(): Promise<void> {
    localStorage.removeItem('token');
    return Promise.resolve();
  }

  async isAuthenticated(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    try {
      // Try to get profile to verify if token is valid
      await this.getProfile();
      return true;
    } catch (error) {
      // If profile request fails, token is invalid
      localStorage.removeItem('token');
      return false;
    }
  }

  async getRooms(): Promise<Chat[]> {
    const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
        headers: this.getHeaders(),
    });
    if (!response.ok) {
        throw new Error('Get rooms failed');
    }
    return response.json();
  }

  async createRoom(roomData: { name: string; type: 'dm' | 'group'; participants: string[] }): Promise<Chat> {
    const response = await fetch(`${API_BASE_URL}/chat/rooms`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
            name: roomData.name,
            isGroup: roomData.type === 'group',
            participantIds: roomData.participants
        }),
    });
    if (!response.ok) {
        throw new Error('Create room failed');
    }
    return response.json();
  }

  async getRoomMessages(roomId: string): Promise<Message[]> {
    const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/messages`, {
        headers: this.getHeaders(),
    });
    if (!response.ok) {
        throw new Error('Get room messages failed');
    }
    return response.json();
  }

  async sendMessage(roomId: string, messageData: { text: string; type: 'text' | 'image' | 'link' }): Promise<Message> {
    const response = await fetch(`${API_BASE_URL}/chat/rooms/${roomId}/messages`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ content: messageData.text, messageType: messageData.type }),
    });
    if (!response.ok) {
        throw new Error('Send message failed');
    }
    return response.json();
  }

  async getFriends(): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/friends`, {
        headers: this.getHeaders(),
    });
    if (!response.ok) {
        throw new Error('Get friends failed');
    }
    return response.json();
  }

  async sendFriendRequest(friendEmail: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/friends/requests`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ email: friendEmail }),
    });
    if (!response.ok) {
        throw new Error('Send friend request failed');
    }
  }

  async getFriendRequests(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/friends/requests`, {
        headers: this.getHeaders(),
    });
    if (!response.ok) {
        throw new Error('Get friend requests failed');
    }
    return response.json();
  }

  async acceptFriendRequest(requestId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/friends/requests/${requestId}/accept`, {
        method: 'PUT',
        headers: this.getHeaders(),
    });
    if (!response.ok) {
        throw new Error('Accept friend request failed');
    }
  }

  async rejectFriendRequest(requestId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/friends/requests/${requestId}/reject`, {
      method: 'PUT',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Reject friend request failed');
    }
  }

  async removeFriend(friendId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/friends/${friendId}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Remove friend failed');
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    const response = await fetch(`${API_BASE_URL}/users/search?q=${query}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      throw new Error('Search users failed');
    }
    return response.json();
  }

  async findUser(query: string): Promise<{ user: User; status: string } | null> {
    const response = await fetch(`${API_BASE_URL}/users/find?q=${query}`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Find user failed');
    }
    return response.json();
  }
}

export const apiService = new ApiService();
