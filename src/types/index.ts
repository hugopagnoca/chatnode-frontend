// User types
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

// Auth types
export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// Room types
export interface Room {
  id: string;
  name: string;
  description?: string;
  type?: string; // "public" or "direct"
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  unreadCount?: number;
}

// Message types
export interface Message {
  id: string;
  content: string;
  roomId: string;
  userId: string;
  user: {
    id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Socket event types
export interface UserJoinedEvent {
  userId: string;
  username: string;
  roomId: string;
  timestamp: Date;
}

export interface UserLeftEvent {
  userId: string;
  username: string;
  roomId: string;
  timestamp: Date;
}

export interface UserTypingEvent {
  userId: string;
  username: string;
  roomId: string;
  isTyping: boolean;
}
