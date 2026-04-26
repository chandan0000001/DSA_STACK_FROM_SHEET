import crypto from 'crypto';
import Room from '../models/room.model.js';
import { getUserProgressSummary } from './userProgress.controller.js';
import userModel from '../models/user.model.js';

// Helper to generate 6-character alphanumeric invite code
async function generateUniqueInviteCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let isUnique = false;
    let code = '';
    
    while (!isUnique) {
        code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const existingRoom = await Room.findOne({ inviteCode: code });
        if (!existingRoom) isUnique = true;
    }
    return code;
}

function ensureRoomOwner(room) {
    if (!room.owner) {
        room.owner = room.admin;
    }
}

export const createRoom = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, discordLink } = req.body;

        if (!name || name.trim().length < 2) {
            return res.status(400).json({ message: "Room name must be at least 2 characters" });
        }

        // Rule: max 5 rooms created by a user
        const createdRoomsCount = await Room.countDocuments({
            $or: [
                { owner: userId },
                { owner: { $exists: false }, admin: userId }
            ]
        });
        if (createdRoomsCount >= 5) {
            return res.status(400).json({ message: "You can only create up to 5 rooms" });
        }

        // Rule: max 20 joined rooms per user
        const joinedRoomsCount = await Room.countDocuments({ members: userId });
        if (joinedRoomsCount >= 20) {
            return res.status(400).json({ message: "You can only join up to 20 rooms" });
        }

        const inviteCode = await generateUniqueInviteCode();

        const room = await Room.create({
            name: name.trim(),
            admin: userId,
            owner: userId,
            members: [userId],
            discordLink: discordLink ? discordLink.trim() : "",
            inviteCode,
        });

        return res.status(201).json({ message: "Room created successfully", room });
    } catch (error) {
        console.error("Create room error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const joinRoom = async (req, res) => {
    try {
        const userId = req.user._id;
        let { inviteCode } = req.body;

        if (!inviteCode) {
            return res.status(400).json({ message: "Invite code is required" });
        }

        inviteCode = inviteCode.trim().toUpperCase();

        const room = await Room.findOne({ inviteCode });
        if (!room) {
            return res.status(404).json({ message: "Invalid invite code" });
        }

        ensureRoomOwner(room);

        // Check if already a member
        if (room.members.some(memberId => memberId.toString() === userId.toString())) {
            return res.status(400).json({ message: "You are already a member of this room" });
        }

        // Rule: max 20 joined rooms per user
        const joinedRoomsCount = await Room.countDocuments({ members: userId });
        if (joinedRoomsCount >= 20) {
            return res.status(400).json({ message: "You can only join up to 20 rooms" });
        }

        if (room.members.length >= (room.maxMembers || 20)) {
            return res.status(400).json({ message: "This room is full" });
        }

        // Remove from pastMembers if they are rejoining via invite code
        room.pastMembers = room.pastMembers.filter(m => m.toString() !== userId.toString());
        
        room.members.push(userId);
        await room.save();

        return res.status(200).json({ message: "Joined room successfully", room });
    } catch (error) {
        console.error("Join room error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUserRooms = async (req, res) => {
    try {
        const userId = req.user._id;
        
        const activeRooms = await Room.find({ members: userId })
            .select('-inviteCode')
            .populate('members', 'name avatar _id')
            .sort({ createdAt: -1 });
        const pastRooms = await Room.find({ pastMembers: userId })
            .select('name createdAt admin owner')
            .sort({ createdAt: -1 });

        const mappedPastRooms = pastRooms.map((room) => {
            const ownerId = room.owner?.toString() || room.admin?.toString();
            const adminId = room.admin?.toString();

            return {
                _id: room._id,
                name: room.name,
                createdAt: room.createdAt,
                canDeleteForEveryone: ownerId === userId.toString() || adminId === userId.toString(),
            };
        });

        return res.status(200).json({ rooms: activeRooms, pastRooms: mappedPastRooms });
    } catch (error) {
        console.error("Get user rooms error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getRoomDetails = async (req, res) => {
    try {
        const userId = req.user._id;
        const roomId = req.params.id;

        const room = await Room.findById(roomId).populate('members', 'name avatar _id');
        
        if (!room) {
            return res.status(404).json({ message: "Room not found" });
        }

        ensureRoomOwner(room);

        // Ensure user is part of the room
        const isMember = room.members.some(member => member._id.toString() === userId.toString());
        if (!isMember && room.admin.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You do not have access to this room" });
        }

        // Fetch progress summary for each member
        const membersProgress = await Promise.all(
            room.members.map(async (member) => {
                const summary = await getUserProgressSummary(member._id);
                return {
                    user: member,
                    summary
                };
            })
        );

        return res.status(200).json({
            room: {
                _id: room._id,
                name: room.name,
                admin: room.admin,
                owner: room.owner || room.admin,
                discordLink: room.discordLink,
                maxMembers: room.maxMembers || 20,
                inviteCode: room.admin.toString() === userId.toString() ? room.inviteCode : undefined,
                createdAt: room.createdAt,
            },
            membersProgress
        });
    } catch (error) {
        console.error("Get room details error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateRoom = async (req, res) => {
    try {
        const userId = req.user._id;
        const roomId = req.params.id;
        const { discordLink, name } = req.body;

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        ensureRoomOwner(room);

        if (room.admin.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Only the admin can update the room" });
        }

        if (discordLink !== undefined) {
            const link = discordLink.trim();
            if (link && !link.startsWith("https://discord.gg/") && !link.startsWith("https://discord.com/")) {
                return res.status(400).json({ message: "Invalid Discord invite link" });
            }
            room.discordLink = link;
        }
        if (name !== undefined && name.trim().length >= 2) room.name = name.trim();

        await room.save();
        return res.status(200).json({ message: "Room updated successfully", room });
    } catch (error) {
        console.error("Update room error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const removeMember = async (req, res) => {
    try {
        const adminId = req.user._id;
        const roomId = req.params.id;
        const { memberId } = req.body;

        if (!memberId) return res.status(400).json({ message: "memberId is required" });

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        ensureRoomOwner(room);

        if (room.admin.toString() !== adminId.toString()) {
            return res.status(403).json({ message: "Only the admin can remove members" });
        }

        if (adminId.toString() === memberId.toString()) {
            return res.status(400).json({ message: "Admin cannot remove themselves" });
        }

        room.members = room.members.filter(m => m.toString() !== memberId.toString());
        await room.save();

        return res.status(200).json({ message: "Member removed successfully" });
    } catch (error) {
        console.error("Remove member error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const leaveRoom = async (req, res) => {
    try {
        const userId = req.user._id;
        const roomId = req.params.id;

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        ensureRoomOwner(room);

        const isMember = room.members.some(m => m.toString() === userId.toString());
        if (!isMember) return res.status(400).json({ message: "You are not a member of this room" });

        // Remove user from members and add to pastMembers
        room.members = room.members.filter(m => m.toString() !== userId.toString());
        if (!room.pastMembers.some(m => m.toString() === userId.toString())) {
            room.pastMembers.push(userId);
        }

        // If admin leaves, transfer admin to the first available member
        if (room.members.length > 0 && room.admin.toString() === userId.toString()) {
            room.admin = room.members[0];
        }

        await room.save();
        return res.status(200).json({ message: "Left room successfully" });
    } catch (error) {
        console.error("Leave room error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteRoom = async (req, res) => {
    try {
        const userId = req.user._id;
        const roomId = req.params.id;

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        ensureRoomOwner(room);

        const ownerId = room.owner?.toString() || room.admin.toString();
        const adminId = room.admin.toString();
        const isPastMember = room.pastMembers.some(m => m.toString() === userId.toString());
        const canDeleteForEveryone = ownerId === userId.toString() || adminId === userId.toString();

        if (canDeleteForEveryone) {
            await Room.findByIdAndDelete(roomId);
            return res.status(200).json({ message: "Room deleted successfully for everyone" });
        }

        if (!isPastMember) {
            return res.status(403).json({ message: "You can only delete rooms from your history after leaving" });
        }

        room.pastMembers = room.pastMembers.filter(m => m.toString() !== userId.toString());
        await room.save();

        return res.status(200).json({ message: "Room removed from your history" });
    } catch (error) {
        console.error("Delete room error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const rejoinRoom = async (req, res) => {
    try {
        const userId = req.user._id;
        const roomId = req.params.id;

        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ message: "Room not found" });

        ensureRoomOwner(room);

        const isPastMember = room.pastMembers.some(m => m.toString() === userId.toString());
        if (!isPastMember) {
            return res.status(400).json({ message: "You cannot rejoin a room you were not a part of. Please use an invite code." });
        }

        if (room.members.some(m => m.toString() === userId.toString())) {
            return res.status(400).json({ message: "You are already a member" });
        }

        // Rule: max 20 joined rooms per user
        const joinedRoomsCount = await Room.countDocuments({ members: userId });
        if (joinedRoomsCount >= 20) {
            return res.status(400).json({ message: "You can only join up to 20 rooms" });
        }

        if (room.members.length >= (room.maxMembers || 20)) {
            return res.status(400).json({ message: "This room is full" });
        }

        room.pastMembers = room.pastMembers.filter(m => m.toString() !== userId.toString());
        room.members.push(userId);
        await room.save();

        return res.status(200).json({ message: "Rejoined room successfully", room });
    } catch (error) {
        console.error("Rejoin room error:", error);
        return res.status(500).json({ message: "Server error", error: error.message });
    }
};
