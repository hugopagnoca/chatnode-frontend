import { useState, useEffect } from 'react';
import { useChatStore } from '../../store/chatStore';
import { api } from '../../services/api';
import { socket } from '../../services/socket';

export function Sidebar() {
  const {
    rooms,
    users,
    currentRoom,
    setCurrentRoom,
    fetchRooms,
    fetchUsers,
    isLoadingRooms,
    isLoadingUsers,
    createDirectMessage
  } = useChatStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Fetch users on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSelectRoom = async (room: typeof rooms[0]) => {
    try {
      // Leave current room
      if (currentRoom) {
        socket.leaveRoom(currentRoom.id);
      }

      // Join new room
      await api.joinRoom(room.id);
      socket.joinRoom(room.id);

      setCurrentRoom(room);

      // Mark room as read
      await api.markRoomAsRead(room.id);

      // Refresh rooms to update unread counts
      await fetchRooms();
    } catch (error) {
      console.error('Failed to join room:', error);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      setIsCreating(true);
      const room = await api.createRoom({
        name: newRoomName,
        description: newRoomDescription || undefined,
      });

      await fetchRooms();
      setShowCreateModal(false);
      setNewRoomName('');
      setNewRoomDescription('');

      // Auto-join the created room
      handleSelectRoom(room);
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenDM = async (userId: string, username: string) => {
    try {
      const room = await createDirectMessage(userId, username);
      await handleSelectRoom(room);
    } catch (error) {
      console.error('Failed to open DM:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Create Room Button */}
      <div className="p-4">
        <button
          onClick={() => setShowCreateModal(true)}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Room
        </button>
      </div>

      {/* Rooms List */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Available Rooms
          </h3>
        </div>

        {isLoadingRooms ? (
          <div className="px-4 py-8 text-center text-gray-500">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="px-4 py-8 text-center text-gray-500">
            <p>No rooms available</p>
            <p className="text-sm mt-2">Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-1 px-2">
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleSelectRoom(room)}
                className={`w-full text-left px-3 py-3 rounded-lg transition ${
                  currentRoom?.id === room.id
                    ? 'bg-blue-100 text-blue-900'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                    {room.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{room.name}</h4>
                    {room.description && (
                      <p className="text-sm text-gray-500 truncate">{room.description}</p>
                    )}
                  </div>
                  {room.unreadCount && room.unreadCount > 0 && (
                    <div className="flex-shrink-0 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                      {room.unreadCount > 99 ? '99+' : room.unreadCount}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Users List */}
        <div className="px-4 py-2 mt-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Direct Messages
          </h3>
        </div>

        {isLoadingUsers ? (
          <div className="px-4 py-4 text-center text-gray-500 text-sm">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="px-4 py-4 text-center text-gray-500 text-sm">
            <p>No other users online</p>
          </div>
        ) : (
          <div className="space-y-1 px-2 pb-4">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleOpenDM(user.id, user.username)}
                className="w-full text-left px-3 py-2 rounded-lg transition hover:bg-gray-100 text-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.username.replace('@', '').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate text-sm">{user.username}</h4>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create New Room</h2>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Room Name *
                </label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="General Chat"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="A place to chat about anything"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewRoomName('');
                    setNewRoomDescription('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newRoomName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
