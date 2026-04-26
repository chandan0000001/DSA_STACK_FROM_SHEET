import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../config/Axios.config.js';
import { useAuth } from '../context/auth.context.jsx';

const RoomDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [roomData, setRoomData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({ name: '', discordLink: '' });
  const [modalLoading, setModalLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  const fetchRoomDetails = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get(`/room/${id}`);
      setRoomData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load room details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomDetails();
  }, [id]);

  const handleEditRoom = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    try {
      await axiosInstance.put(`/room/${id}`, editData);
      setShowEditModal(false);
      fetchRoomDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update room");
    } finally {
      setModalLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await axiosInstance.post(`/room/${id}/remove`, { memberId });
      fetchRoomDetails();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove member");
    }
  };

  const handleLeaveRoom = async () => {
    if (!window.confirm("Are you sure you want to leave this room?")) return;
    try {
      await axiosInstance.post(`/room/${id}/leave`);
      navigate('/rooms');
    } catch (err) {
      alert(err.response?.data?.message || "Failed to leave room");
    }
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm("Are you sure you want to delete this room for everyone?")) return;
    try {
      await axiosInstance.delete(`/room/${id}/delete`);
      navigate('/rooms');
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete room");
    }
  };

  const handleShareInvite = async () => {
    if (!room.inviteCode) return;

    const shareText = `Join "${room.name}" with invite code: ${room.inviteCode}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${room.name} Invite`,
          text: shareText,
        });
        setShareMessage('Invite shared');
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(room.inviteCode);
        setShareMessage('Invite code copied');
      } else {
        setShareMessage(`Invite code: ${room.inviteCode}`);
      }
    } catch (err) {
      setShareMessage('Share cancelled');
    }

    window.setTimeout(() => setShareMessage(''), 2500);
  };

  const openEditModal = () => {
    setEditData({ 
      name: roomData.room.name, 
      discordLink: roomData.room.discordLink 
    });
    setShowEditModal(true);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070707] text-white p-6 flex flex-col items-center justify-center">
        <div className="bg-[#0b0b0b] border border-white/10 p-8 rounded-2xl max-w-md text-center">
          <i className="ri-lock-2-line text-5xl text-[#A4873E] mb-4"></i>
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-6">You have to login to view room details.</p>
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
        <p className="text-gray-400 animate-pulse">Loading room details...</p>
      </div>
    );
  }

  if (error || !roomData) {
    return (
      <div className="min-h-screen bg-[#070707] text-white p-6 flex flex-col items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl max-w-md text-center">
          <p className="text-xl font-bold mb-2">Oops!</p>
          <p>{error || "Room not found"}</p>
          <button 
            onClick={() => navigate('/rooms')}
            className="mt-4 px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
          >
            Back to Rooms
          </button>
        </div>
      </div>
    );
  }

  const { room, membersProgress } = roomData;
  const currentUserId = currentUser?.id || currentUser?._id;
  const isAdmin = Boolean(currentUserId && room.admin === currentUserId);
  const isOwner = Boolean(currentUserId && room.owner === currentUserId);
  const canDeleteRoom = isAdmin || isOwner;

  return (
    <div className="min-h-screen bg-[#070707] text-white p-6 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER */}
        <div className="bg-[#0b0b0b] border border-white/10 rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-[#A4873E] capitalize">{room.name}</h1>
              {isAdmin && (
                <button onClick={openEditModal} className="text-gray-500 hover:text-white transition">
                  <i className="ri-edit-line"></i>
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-3">
              <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                <i className="ri-team-line"></i> {membersProgress.length} Members
              </span>
              <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full">
                <i className="ri-group-line"></i> {membersProgress.length} / {room.maxMembers} Filled
              </span>
              
              {isAdmin && room.inviteCode && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 bg-[#A4873E]/10 text-[#A4873E] px-3 py-1 rounded-full border border-[#A4873E]/20">
                    <i className="ri-key-2-line"></i> Invite: <strong className="tracking-widest">{room.inviteCode}</strong>
                  </span>
                  <button
                    onClick={handleShareInvite}
                    className="h-9 w-9 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition flex items-center justify-center"
                    title="Share invite code"
                  >
                    <i className="ri-share-forward-line"></i>
                  </button>
                </div>
              )}
            </div>
            {isAdmin && shareMessage && (
              <p className="text-xs text-[#A4873E] mt-3">{shareMessage}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {room.discordLink && (
              <a 
                href={room.discordLink} 
                target="_blank" 
                rel="noreferrer"
                className="px-5 py-2.5 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#5865F2] hover:bg-[#5865F2]/20 transition flex items-center justify-center gap-2 font-medium"
              >
                <i className="ri-discord-fill text-lg"></i> Join Discord
              </a>
            )}
            <button 
              onClick={handleLeaveRoom}
              className="px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition flex items-center justify-center gap-2 font-medium"
            >
              <i className="ri-logout-box-line text-lg"></i> Leave Room
            </button>
            {canDeleteRoom && (
              <button 
                onClick={handleDeleteRoom}
                className="px-5 py-2.5 rounded-xl bg-red-500 border border-red-500 text-white hover:bg-red-600 transition flex items-center justify-center gap-2 font-medium"
              >
                <i className="ri-delete-bin-line text-lg"></i> Delete Room
              </button>
            )}
          </div>
        </div>

        {/* MEMBERS GRID */}
        <h2 className="text-xl font-bold mb-4">Member Progress</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {membersProgress.map(({ user, summary }) => (
            <div 
              key={user._id}
              className="bg-[#0b0b0b] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition group relative"
            >
              {/* Admin Badge */}
              {user._id === room.admin && (
                <div className="absolute -top-3 -right-3 h-8 w-8 bg-[#A4873E] text-[#070707] rounded-full flex items-center justify-center shadow-lg" title="Room Admin">
                  <i className="ri-vip-crown-fill"></i>
                </div>
              )}

              {/* Remove Button (Admin only) */}
              {isAdmin && user._id !== currentUserId && (
                <button 
                  onClick={(e) => { e.stopPropagation(); handleRemoveMember(user._id); }}
                  className="absolute top-4 right-4 text-gray-500 hover:text-red-400 transition"
                  title="Remove Member"
                >
                  <i className="ri-user-unfollow-line text-lg"></i>
                </button>
              )}

              <div 
                className="cursor-pointer"
                onClick={() => navigate(`/profile/${user._id}`)}
              >
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-[#181818] border border-white/10 flex items-center justify-center text-lg font-bold group-hover:border-[#A4873E]/50 transition">
                    {user.avatar ? (
                      <img src={user.avatar} alt="avatar" className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      getInitials(user.name)
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold capitalize group-hover:text-[#A4873E] transition pr-8">{user.name}</h3>
                    <p className="text-xs text-gray-500">View full profile <i className="ri-arrow-right-s-line"></i></p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#181818] rounded-xl p-3 text-center border border-white/5">
                    <p className="text-2xl font-bold text-blue-400">{summary.totalCompleted}</p>
                    <p className="text-xs text-gray-400">Solved</p>
                  </div>
                  <div className="bg-[#181818] rounded-xl p-3 text-center border border-white/5">
                    <p className="text-2xl font-bold text-green-400">{summary.streak}</p>
                    <p className="text-xs text-gray-400">Streak</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0b0b0b] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-5">Edit Room</h2>
            
            <form onSubmit={handleEditRoom} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Room Name *</label>
                <input 
                  type="text" 
                  required 
                  minLength={2}
                  maxLength={50}
                  value={editData.name}
                  onChange={(e) => setEditData({...editData, name: e.target.value})}
                  className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#A4873E] transition"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Discord Link (Optional)</label>
                <input 
                  type="url" 
                  value={editData.discordLink}
                  onChange={(e) => setEditData({...editData, discordLink: e.target.value})}
                  className="w-full bg-transparent border border-white/10 rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#A4873E] transition"
                  placeholder="https://discord.gg/..."
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={modalLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#A4873E] text-white font-medium hover:bg-[#A4873E]/90 transition disabled:opacity-50"
                >
                  {modalLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetails;
