import express from 'express'
import cookieParser from "cookie-parser";
import cors from "cors";
import authRoutes from '../src/routes/auth.route.js'
import problemsRoutes from '../src/routes/problems.route.js'
import userProgressRoutes from '../src/routes/userProgress.route.js'
import dailyProblem from '../src/routes/getDailyProblems.route.js'
import roomRoutes from '../src/routes/room.route.js'
import {sendEmail} from '../src/utils/sendEmail.utils.js'

const app = express();
app.set('trust proxy', 1);

const corsOptions = {
  origin: 'https://dsa-stack-from-sheet.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

app.get('/' , (req , res) => {
    res.send("checking the page status!!")
})



app.get("/test-email", async (req, res) => {
  await sendEmail({
    to: "yourpersonalemail@gmail.com",
    subject: "Test Email 🚀",
    html: "<h1>It works bro 🔥</h1>",
  });

  res.send("Email sent");
});



app.use('/user' , authRoutes )
app.use('/user/progress' , userProgressRoutes )
app.use('/problems' , problemsRoutes )
app.use('/progress' , userProgressRoutes )
app.use('/problem' , dailyProblem )
app.use('/room' , roomRoutes )

export default app; 
