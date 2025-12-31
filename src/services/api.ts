import type { AuthResponse, LoginCredentials, RegisterCredentials, Room, Message, User } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data.data;
  }

  // Auth endpoints
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Room endpoints
  async getRooms(): Promise<Room[]> {
    return this.request<Room[]>('/rooms');
  }

  async getMyRooms(): Promise<Room[]> {
    return this.request<Room[]>('/rooms/my');
  }

  async getRoom(roomId: string): Promise<Room> {
    return this.request<Room>(`/rooms/${roomId}`);
  }

  async createRoom(data: { name: string; description?: string }): Promise<Room> {
    return this.request<Room>('/rooms', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async joinRoom(roomId: string): Promise<void> {
    return this.request(`/rooms/${roomId}/join`, {
      method: 'POST',
    });
  }

  async leaveRoom(roomId: string): Promise<void> {
    return this.request(`/rooms/${roomId}/leave`, {
      method: 'POST',
    });
  }

  async markRoomAsRead(roomId: string): Promise<void> {
    return this.request(`/rooms/${roomId}/mark-read`, {
      method: 'POST',
    });
  }

  // Message endpoints
  async getMessages(roomId: string, page = 1, limit = 50): Promise<{ messages: Message[] }> {
    return this.request<{ messages: Message[] }>(
      `/rooms/${roomId}/messages?page=${page}&limit=${limit}`
    );
  }

  async sendMessage(roomId: string, content: string): Promise<Message> {
    return this.request<Message>(`/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // User endpoints
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/users');
  }

  async createDirectMessage(userId: string, username: string): Promise<Room> {
    return this.request<Room>(`/rooms/direct/${userId}`, {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }
}

export const api = new ApiService();
