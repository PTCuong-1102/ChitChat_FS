import { User, Chat, Message } from '../types';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://vgetclpelqhzvrlthwau.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnZXRjbHBlbHFoenZybHRod2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0ODI5NjYsImV4cCI6MjA2ODA1ODk2Nn0.TjMbHhnYzZm14PnJf3V1__1WPMZrdCEtesq3Kwjx3-Q';

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to transform Supabase user data to frontend format
function transformUser(supabaseUser: any): User {
  return {
    id: supabaseUser.id,
    full_name: supabaseUser.full_name,
    user_name: supabaseUser.user_name,
    avatar_url: supabaseUser.avatar_url,
    email: supabaseUser.email,
    status: supabaseUser.status,
    // Computed properties for backwards compatibility
    name: supabaseUser.full_name || supabaseUser.user_name,
    username: supabaseUser.user_name,
    avatar: supabaseUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(supabaseUser.user_name || 'User')}&background=pink&color=fff`,
  };
}

class ApiService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = supabase;
  }

  // Auth methods
  async register(userData: {
    userName: string;
    email: string;
    password: string;
    fullName: string;
  }): Promise<{ user: User; token: string }> {
    try {
      // First, register with Supabase Auth
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Registration failed');

      // Then create user profile in public.users table
      const { data: userProfile, error: profileError } = await this.supabase
        .from('users')
        .insert({
          id: authData.user.id,
          full_name: userData.fullName,
          user_name: userData.userName,
          avatar_url: null,
          status: true,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      const user = transformUser({
        ...userProfile,
        email: authData.user.email,
      });

      return {
        user,
        token: authData.session?.access_token || '',
      };
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<{ user: User; token: string }> {
    try {
      console.log('ApiService: Attempting login with:', { email: credentials.email });
      
      const { data: authData, error: authError } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Login failed');

      // Get user profile from public.users table
      const { data: userProfile, error: profileError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) throw profileError;

      const user = transformUser({
        ...userProfile,
        email: authData.user.email,
      });

      console.log('ApiService: Login successful');
      return {
        user,
        token: authData.session?.access_token || '',
      };
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async getProfile(): Promise<User> {
    try {
      const { data: { user }, error: authError } = await this.supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not authenticated');

      const { data: userProfile, error: profileError } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      return transformUser({
        ...userProfile,
        email: user.email,
      });
    } catch (error) {
      console.error('Get profile failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.supabase.auth.signOut();
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  // Chat methods
  async getRooms(): Promise<Chat[]> {
    try {
      const { data: rooms, error } = await this.supabase
        .from('chat_rooms')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return rooms || [];
    } catch (error) {
      console.error('Get rooms failed:', error);
      throw error;
    }
  }

  async createRoom(roomData: {
    name: string;
    type: 'dm' | 'group';
    participants: string[];
  }): Promise<Chat> {
    try {
      const { data: room, error } = await this.supabase
        .from('chat_rooms')
        .insert({
          name: roomData.name,
          is_group: roomData.type === 'group',
        })
        .select()
        .single();

      if (error) throw error;

      await this.addParticipantsToRoom(room.id, roomData.participants);

      return room;
    } catch (error) {
      console.error('Create room failed:', error);
      throw error;
    }
  }

  private async addParticipantsToRoom(roomId: string, participants: string[]): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('room_participants')
        .insert(participants.map(userId => ({ room_id: roomId, user_id: userId, joined_at: new Date() })));

      if (error) throw error;
    } catch (error) {
      console.error('Add participants to room failed:', error);
      throw error;
    }
  }

  async getRoomMessages(roomId: string): Promise<Message[]> {
    try {
      const { data: messages, error } = await this.supabase
        .from('messages')
        .select('*')
        .eq('room_id', roomId)
        .order('sent_at', { ascending: false });

      if (error) throw error;
      return messages || [];
    } catch (error) {
      console.error('Get room messages failed:', error);
      throw error;
    }
  }

  async sendMessage(roomId: string, messageData: {
    text: string;
    type: 'text' | 'image' | 'link';
  }): Promise<Message> {
    try {
      const { data: message, error } = await this.supabase
        .from('messages')
        .insert({
          room_id: roomId,
          content: messageData.text,
          message_type: messageData.type,
          sender_id: (await this.supabase.auth.getUser()).data.user?.id,
          sent_at: new Date(),
        })
        .select()
        .single();

      if (error) throw error;
      return message;
    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  }

  async getRoomParticipants(roomId: string): Promise<User[]> {
    try {
      const { data: participants, error } = await this.supabase
        .from('room_participants')
        .select('*, users(*)')
        .eq('room_id', roomId);

      if (error) throw error;

      return participants.map((participant: any) => transformUser(participant.users)) || [];
    } catch (error) {
      console.error('Get room participants failed:', error);
      throw error;
    }
  }

  async addParticipant(roomId: string, participantData: {
    userId: string;
  }): Promise<void> {
    try {
      await this.supabase
        .from('room_participants')
        .insert({
          room_id: roomId,
          user_id: participantData.userId,
          joined_at: new Date(),
        });
    } catch (error) {
      console.error('Add participant failed:', error);
      throw error;
    }
  }

  async removeParticipant(roomId: string, participantId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('room_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', participantId);

      if (error) throw error;
    } catch (error) {
      console.error('Remove participant failed:', error);
      throw error;
    }
  }

  // Friends methods
  async sendFriendRequest(friendEmail: string): Promise<void> {
    try {
      const { data: recipient, error } = await this.supabase
        .from('users')
        .select('id')
        .eq('email', friendEmail)
        .single();

      if (error) throw error;

      await this.supabase
        .from('user_contacts')
        .insert({
          user_id: (await this.supabase.auth.getUser()).data.user?.id,
          friend_id: recipient.id,
          created_at: new Date(),
        });
    } catch (error) {
      console.error('Send friend request failed:', error);
      throw error;
    }
  }

  async getFriendRequests(): Promise<any[]> {
    try {
      const { data: requests, error } = await this.supabase
        .from('user_contacts')
        .select('*, users(*)')
        .eq('friend_id', (await this.supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      return requests.map(request => ({
        ...request,
        user: transformUser(request.users),
      })) || [];
    } catch (error) {
      console.error('Get friend requests failed:', error);
      throw error;
    }
  }

  async acceptFriendRequest(requestId: number): Promise<void> {
    // Implement accept friend request operation
    console.log('Accept friend request:', requestId);
  }

  async rejectFriendRequest(requestId: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_contacts')
        .delete()
        .eq('id', requestId)
        .eq('friend_id', (await this.supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
    } catch (error) {
      console.error('Reject friend request failed:', error);
      throw error;
    }
  }

  async getFriends(): Promise<User[]> {
    try {
      const { data: friends, error } = await this.supabase
        .from('user_contacts')
        .select('*, users(*)')
        .eq('user_id', (await this.supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      return friends.map(friend => transformUser(friend.users)) || [];
    } catch (error) {
      console.error('Get friends failed:', error);
      throw error;
    }
  }

  async searchUsers(query: string): Promise<{ user: User; status: string }[]> {
    try {
      const { data: users, error } = await this.supabase
        .from('users')
        .select('*')
        .ilike('user_name', `%${query}%`);

      if (error) throw error;

      return users.map(user => ({
        user: transformUser(user),
        status: 'unknown',
      })) || [];
    } catch (error) {
      console.error('Search users failed:', error);
      throw error;
    }
  }

  async findUser(query: string): Promise<{ user: User; status: string } | null> {
    try {
      const { data: user, error } = await this.supabase
        .from('users')
        .select('*')
        .ilike('user_name', query)
        .single();

      if (error) throw error;

      return {
        user: transformUser(user),
        status: 'unknown',
      };
    } catch (error) {
      console.error('Find user failed:', error);
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }
  }

  async removeFriend(friendId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('user_contacts')
        .delete()
        .eq('user_id', (await this.supabase.auth.getUser()).data.user?.id)
        .eq('friend_id', friendId);

      if (error) throw error;
    } catch (error) {
      console.error('Remove friend failed:', error);
      throw error;
    }
  }

  // Helper methods
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { user } } = await this.supabase.auth.getUser();
      return user !== null;
    } catch {
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      return session?.access_token || null;
    } catch {
      return null;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string }> {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'Supabase',
    };
  }
}

export const apiService = new ApiService();
