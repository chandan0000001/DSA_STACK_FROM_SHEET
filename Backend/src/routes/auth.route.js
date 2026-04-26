import express from 'express'
import * as controller from '../controller/auth.controller.js'
import { authMiddleware } from '../middleware/auth.middleware.js'

const router = express.Router();

// Public
router.post('/register',              controller.UserRegister);
router.post('/login',                 controller.UserLogin);
router.post('/google',                controller.googleAuth);
router.get('/verify/:token',          controller.verifyEmailRedirect);
router.post('/verify/:token',         controller.verifyEmail);
router.post('/resend-verification',   controller.resendVerification);
router.post('/refresh-token',         controller.refreshAccessToken);
router.post('/forgot-password',       controller.forgotPassword);
router.post('/reset-password/:token', controller.resetPassword);

// Protected
router.post('/logout',  authMiddleware, controller.UserLogout);
router.get('/me',       authMiddleware, controller.getCurrentUser);

export default router;
