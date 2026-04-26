import React, { useState, useEffect } from 'react';
import axiosInstance from '../config/Axios.config.js';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth.context.jsx';

const Rooms = () => {
  const [rooms, setRooms] = useState([]);
  const [pastRooms, setPastRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  const [createData, setCreateData] = useState({ name: '', discordLink: '' });
  const [joinData, setJoinData] = useState({ inviteCode: '' });
  
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/room');
      setRooms(res.data.rooms || []);
      setPastRooms(res.data.pastRooms || []);
    } catch (err) {
      setError("Failed to load rooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);
    try {
      const res = await axiosInstance.post('/room/create', createData);
      setShowCreateModal(false);
      setCreateData({ name: '', discordLink: '' });
      fetchRooms();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to create room");
    } finally {
      setModalLoading(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    setModalError(null);
    setModalLoading(true);
    try {
      await axiosInstance.post('/room/join', joinData);
      setShowJoinModal(false);
      setJoinData({ inviteCode: '' });
      fetchRooms();
    } catch (err) {
      setModalError(err.response?.data?.message || "Failed to join room");
    } finally {
      setModalLoading(false);
    }
  };

  const handleRejoinRoom = async (roomId) => {
    try {
      await axiosInstance.post(`/room/${roomId}/rejoin`);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to rejoin room");
    }
  };

  const handleDeleteRoom = async (roomId, canDeleteForEveryone) => {
    const message = canDeleteForEveryone
      ? "Are you sure you want to delete this room for everyone?"
      : "Are you sure you want to remove this room from your history?";

    if (!window.confirm(message)) return;

    try {
      await axiosInstance.delete(`/room/${roomId}/delete`);
      fetchRooms();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete room");
    }
  };

  const openModal = (setter) => {
    setModalError(null);
    setter(true);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#070707] text-white p-6 flex flex-col items-center justify-center">
        <div className="bg-[#0b0b0b] border border-white/10 p-8 rounded-2xl max-w-md text-center">
          <i className="ri-lock-2-line text-5xl text-[#A4873E] mb-4"></i>
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-6">You have to login to create or join rooms.</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-6 py-2.5 rounded-xl bg-[#A4873E] text-white font-medium hover:bg-[#A4873E]/90 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] text-white flex items-center justify-center">
        <p className="text-gray-400 animate-pulse">Loading rooms...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070707] text-white p-6 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#A4873E]">My Rooms</h1>
            <p className="text-gray-400 mt-1">Collaborate and track progress with your friends</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => openModal(setShowJoinModal)}
              className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition font-medium"
            >
              Join Room
            </button>
            <button 
              onClick={() => openModal(setShowCreateModal)}
              className="px-5 py-2 rounded-xl bg-[#A4873E]/10 border border-[#A4873E]/30 text-[#A4873E] hover:bg-[#A4873E]/20 transition font-medium"
            >
              Create Room
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* ROOMS GRID */}
        {rooms.length === 0 && !error ? (
          <div className="flex flex-col items-center justify-center h-64 border border-white/5 rounded-2xl bg-[#0b0b0b]">
            <i className="ri-team-line text-4xl text-gray-500 mb-3"></i>
            <p className="text-gray-400">You haven't joined any active rooms yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {rooms.map(room => (
              <div 
                key={room._id}
                onClick={() => navigate(`/room/${room._id}`)}
                className="bg-[#0b0b0b] border border-white/10 rounded-2xl p-5 hover:border-white/20 hover:-translate-y-1 transition cursor-pointer flex flex-col gap-3 group relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-[#A4873E]/5 rounded-bl-full -z-10 group-hover:bg-[#A4873E]/10 transition"></div>
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold capitalize group-hover:text-[#A4873E] transition">{room.name}</h3>
                  <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                    <i className="ri-arrow-right-up-line text-gray-400 group-hover:text-white transition"></i>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {room.members.slice(0, 4).map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-300"
                    >
                      <div className="h-6 w-6 rounded-full bg-[#181818] border border-white/10 flex items-center justify-center text-[10px] font-semibold overflow-hidden">
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                        ) : (
                          getInitials(member.name)
                        )}
                      </div>
                      <span className="max-w-24 truncate capitalize">{member.name}</span>
                    </div>
                  ))}
                  {room.members.length > 4 && (
                    <div className="flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-gray-400">
                      +{room.members.length - 4} more
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-auto pt-4 border-t border-white/5">
                  <i className="ri-user-smile-line"></i>
                  <span>{room.members.length} member{room.members.length !== 1 && 's'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAST ROOMS HISTORY */}
        {pastRooms.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-6 opacity-70">
              <i className="ri-history-line text-xl"></i>
              <h2 className="text-xl font-bold">History (Left Rooms)</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {pastRooms.map(room => (
                <div 
                  key={room._id}
                  className="bg-[#070707] border border-white/5 rounded-2xl p-5 flex flex-col gap-4 opacity-70 hover:opacity-100 transition"
                >
                  <h3 className="text-lg font-semibold capitalize text-gray-300">{room.name}</h3>
                  <div className="flex items-center justify-between mt-auto gap-3">
                    <span className="text-xs text-gray-500">Left on {new Date(room.createdAt).toLocaleDateString()}</span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDeleteRoom(room._id, room.canDeleteForEveryone)}
                        className="text-xs px-4 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition text-red-400"
                      >
                        <i className="ri-delete-bin-line mr-1"></i>
                        {room.canDeleteForEveryone ? 'Delete Room' : 'Delete'}
                      </button>
                      <button 
                        onClick={() => handleRejoinRoom(room._id)}
                        className="text-xs px-4 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-[#A4873E]"
                      >
                        <i className="ri-loop-right-line mr-1"></i> Rejoin
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0b0b0b] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-1">Create Room</h2>
            <p className="text-gray-400 text-sm mb-5">Create a space for you and your friends</p>
            
            <form onSubmit={handleCreateRoom} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Room Name *</label>
                <input 
                  type="text" 
                  required 
                  minLength={2}
                  maxLength={50}
                  value={createData.name}
                  onChange={(e) => setCreateData({...createData, name: e.target.value})}
                  className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#A4873E] transition"
                  placeholder="e.g. Code Masters"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Discord Link (Optional)</label>
                <input 
                  type="url" 
                  value={createData.discordLink}
                  onChange={(e) => setCreateData({...createData, discordLink: e.target.value})}
                  className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#A4873E] transition"
                  placeholder="https://discord.gg/..."
                />
              </div>

              {modalError && <p className="text-red-400 text-sm">{modalError}</p>}

              <div className="flex gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={modalLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#A4873E] text-white font-medium hover:bg-[#A4873E]/90 transition disabled:opacity-50"
                >
                  {modalLoading ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JOIN MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0b0b0b] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-1">Join Room</h2>
            <p className="text-gray-400 text-sm mb-5">Enter the 6-character invite code</p>
            
            <form onSubmit={handleJoinRoom} className="flex flex-col gap-4">
              <div>
                <input 
                  type="text" 
                  required 
                  maxLength={6}
                  value={joinData.inviteCode}
                  onChange={(e) => setJoinData({ inviteCode: e.target.value.toUpperCase() })}
                  className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#A4873E] transition text-center text-2xl tracking-widest font-mono"
                  placeholder="XXXXXX"
                />
              </div>

              {modalError && <p className="text-red-400 text-sm text-center">{modalError}</p>}

              <div className="flex gap-3 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={modalLoading || joinData.inviteCode.length < 6}
                  className="flex-1 py-2.5 rounded-xl bg-[#A4873E] text-white font-medium hover:bg-[#A4873E]/90 transition disabled:opacity-50"
                >
                  {modalLoading ? "Joining..." : "Join"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rooms;
