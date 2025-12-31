import { create } from 'zustand';
import { api } from '../services/api';
import type { Room, Message, User } from '../types';

interface ChatState {
  rooms: Room[];
  currentRoom: Room | null;
  messages: Message[];
  users: User[];
  isLoadingRooms: boolean;
  isLoadingMessages: boolean;
  isLoadingUsers: boolean;
  typingUsers: Set<string>;

  // Actions
  fetchRooms: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  setCurrentRoom: (room: Room | null) => void;
  fetchMessages: (roomId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  setTyping: (username: string, isTyping: boolean) => void;
  clearMessages: () => void;
  createDirectMessage: (userId: string, username: string) => Promise<Room>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  currentRoom: null,
  messages: [],
  users: [],
  isLoadingRooms: false,
  isLoadingMessages: false,
  isLoadingUsers: false,
  typingUsers: new Set(),

  fetchRooms: async () => {
    try {
      set({ isLoadingRooms: true });
      const rooms = await api.getMyRooms();
      set({ rooms, isLoadingRooms: false });
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
      set({ isLoadingRooms: false });
    }
  },

  fetchUsers: async () => {
    try {
      set({ isLoadingUsers: true });
      const users = await api.getUsers();
      set({ users, isLoadingUsers: false });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      set({ isLoadingUsers: false });
    }
  },

  setCurrentRoom: (room) => {
    set({ currentRoom: room, messages: [] });
  },

  fetchMessages: async (roomId) => {
    try {
      set({ isLoadingMessages: true });
      const data = await api.getMessages(roomId);
      // Reverse to show oldest first
      set({ messages: data.messages.reverse(), isLoadingMessages: false });
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      set({ isLoadingMessages: false });
    }
  },

  addMessage: (message) => {
    const { currentRoom, messages } = get();
    if (currentRoom && message.roomId === currentRoom.id) {
      set({ messages: [...messages, message] });
    }
  },

  setTyping: (username, isTyping) => {
    const typingUsers = new Set(get().typingUsers);
    if (isTyping) {
      typingUsers.add(username);
    } else {
      typingUsers.delete(username);
    }
    set({ typingUsers });
  },

  clearMessages: () => {
    set({ messages: [], currentRoom: null });
  },

  createDirectMessage: async (userId, username) => {
    try {
      const room = await api.createDirectMessage(userId, username);
      // DMs are not added to the rooms list - they only open when clicking on a user
      return room;
    } catch (error) {
      console.error('Failed to create DM:', error);
      throw error;
    }
  },
}));
