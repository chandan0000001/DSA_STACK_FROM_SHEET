import "dotenv/config";
import app from './src/app.js';
import dbconnect from './src/database/database.js'
import { startDailyEmails } from "./src/cron/dailyEmail.cron.js";
const port = process.env.PORT || 3000;

dbconnect(); 
startDailyEmails();

app.listen(port, () => {});
