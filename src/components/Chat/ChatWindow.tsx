import { useEffect, useState, useRef, useCallback } from 'react';
import { useChatStore } from '../../store/chatStore';
import { useAuthStore } from '../../store/authStore';
import { socket } from '../../services/socket';
import type { Message, UserTypingEvent } from '../../types';

export function ChatWindow() {
  const { currentRoom, messages, fetchMessages, addMessage, setTyping, typingUsers } = useChatStore();
  const { user } = useAuthStore();
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Fetch messages when room changes
  useEffect(() => {
    if (currentRoom) {
      fetchMessages(currentRoom.id);
    }
  }, [currentRoom, fetchMessages]);

  // Stable handlers using useCallback
  const handleMessageReceived = useCallback((message: Message) => {
    addMessage(message);
  }, [addMessage]);

  const handleUserTyping = useCallback((data: UserTypingEvent) => {
    if (data.userId !== user?.id) {
      setTyping(data.username, data.isTyping);
    }
  }, [setTyping, user?.id]);

  // Setup socket listeners - only once
  useEffect(() => {
    socket.onMessageReceived(handleMessageReceived);
    socket.onUserTyping(handleUserTyping);

    return () => {
      socket.offMessageReceived(handleMessageReceived);
      socket.offUserTyping(handleUserTyping);
    };
  }, [handleMessageReceived, handleUserTyping]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !currentRoom || isSending) return;

    setIsSending(true);
    socket.sendMessage(currentRoom.id, inputMessage.trim());
    setInputMessage('');
    setIsSending(false);

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    socket.stopTyping(currentRoom.id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);

    if (!currentRoom) return;

    // Start typing indicator
    socket.startTyping(currentRoom.id);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.stopTyping(currentRoom.id);
    }, 1000);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: string) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: Message[] }[] = [];
  messages.forEach((message) => {
    const dateKey = formatDate(message.createdAt);
    const existing = groupedMessages.find((g) => g.date === dateKey);
    if (existing) {
      existing.messages.push(message);
    } else {
      groupedMessages.push({ date: dateKey, messages: [message] });
    }
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            {currentRoom?.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{currentRoom?.name}</h2>
            {currentRoom?.description && (
              <p className="text-sm text-gray-500">{currentRoom.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
        {groupedMessages.map((group) => (
          <div key={group.date}>
            {/* Date divider */}
            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-sm text-gray-500 font-medium">{group.date}</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Messages */}
            {group.messages.map((message) => {
              const isOwnMessage = message.userId === user?.id;

              return (
                <div
                  key={message.id}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`}
                >
                  <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                    {!isOwnMessage && (
                      <div className="flex items-center gap-2 mb-1 px-1">
                        <span className="text-sm font-semibold text-gray-700">
                          {message.user.username}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(message.createdAt)}
                        </span>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-2 ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-white text-gray-800 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                      {isOwnMessage && (
                        <div className="text-right mt-1">
                          <span className="text-xs text-blue-100">
                            {formatTime(message.createdAt)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {typingUsers.size > 0 && (
        <div className="px-6 py-2 bg-gray-50 text-sm text-gray-500">
          {Array.from(typingUsers).join(', ')}{' '}
          {typingUsers.size === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
