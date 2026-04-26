import express from 'express'
import * as controller from '../controller/problems.controller.js'
import * as Auth from '../middleware/auth.middleware.js'
import admin from '../middleware/admin.middleware.js'

const router = express.Router(); 

router.get('/list' , controller.getProblemsList )
router.post('/addProblems' ,  Auth.authMiddleware , admin ,  controller.postProblems )



export default router; 
