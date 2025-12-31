import { io, Socket } from 'socket.io-client';
import type { Message, UserJoinedEvent, UserLeftEvent, UserTypingEvent } from '../types';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

class SocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    // Prevent multiple connections
    if (this.socket) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      auth: { token },
      withCredentials: true,
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to WebSocket');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Room events
  joinRoom(roomId: string) {
    this.socket?.emit('join-room', { roomId });
  }

  leaveRoom(roomId: string) {
    this.socket?.emit('leave-room', { roomId });
  }

  // Message events
  sendMessage(roomId: string, content: string) {
    this.socket?.emit('send-message', { roomId, content });
  }

  onMessageReceived(callback: (message: Message) => void) {
    this.socket?.on('message-received', callback);
  }

  offMessageReceived(callback: (message: Message) => void) {
    this.socket?.off('message-received', callback);
  }

  // Typing events
  startTyping(roomId: string) {
    this.socket?.emit('typing-start', { roomId });
  }

  stopTyping(roomId: string) {
    this.socket?.emit('typing-stop', { roomId });
  }

  onUserTyping(callback: (data: UserTypingEvent) => void) {
    this.socket?.on('user-typing', callback);
  }

  offUserTyping(callback: (data: UserTypingEvent) => void) {
    this.socket?.off('user-typing', callback);
  }

  // Presence events
  onUserJoined(callback: (data: UserJoinedEvent) => void) {
    this.socket?.on('user-joined', callback);
  }

  offUserJoined(callback: (data: UserJoinedEvent) => void) {
    this.socket?.off('user-joined', callback);
  }

  onUserLeft(callback: (data: UserLeftEvent) => void) {
    this.socket?.on('user-left', callback);
  }

  offUserLeft(callback: (data: UserLeftEvent) => void) {
    this.socket?.off('user-left', callback);
  }

  onRoomJoined(callback: (data: { roomId: string }) => void) {
    this.socket?.on('room-joined', callback);
  }

  offRoomJoined(callback: (data: { roomId: string }) => void) {
    this.socket?.off('room-joined', callback);
  }

  // Error handling
  onError(callback: (error: { message: string }) => void) {
    this.socket?.on('error', callback);
  }

  offError(callback: (error: { message: string }) => void) {
    this.socket?.off('error', callback);
  }
}

export const socket = new SocketService();
