import express from 'express'
import * as controller from '../controller/userProgress.controller.js'
import  {authMiddleware} from '../middleware/auth.middleware.js'

const router = express.Router(); 

router.get('/daily' , authMiddleware ,  controller.getDailyProblems )
router.post('/daily/toggle' , authMiddleware , controller.toggleDailyProblem);
router.get('/daily/finishers' ,authMiddleware ,  controller.getDailyFinishers)


export default router; 