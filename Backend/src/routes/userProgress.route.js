import express from 'express'
import * as controller from '../controller/userProgress.controller.js'
import * as Auth from '../middleware/auth.middleware.js'

const router = express.Router();

router.get('/summary' , Auth.authMiddleware , controller.getProgressSummary);
router.post('/toggle' , Auth.authMiddleware , controller.toggleProblemProgress);
router.get('/public/:userId', controller.getPublicProgressSummary);

export default router;
