import express from 'express';
import { 
    createRoom, 
    joinRoom, 
    getUserRooms, 
    getRoomDetails, 
    updateRoom, 
    removeMember, 
    leaveRoom,
    deleteRoom,
    rejoinRoom
} from '../controller/room.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/create', createRoom);
router.post('/join', joinRoom);
router.get('/', getUserRooms);
router.get('/:id', getRoomDetails);
router.put('/:id', updateRoom);
router.post('/:id/remove', removeMember);
router.post('/:id/leave', leaveRoom);
router.post('/:id/rejoin', rejoinRoom);
router.delete('/:id/delete', deleteRoom);

export default router;
