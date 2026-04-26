import "dotenv/config";
import app from './src/app.js';
import dbconnect from './src/database/database.js'
import { startDailyEmails } from "./src/cron/dailyEmail.cron.js";
import { startKeepAlive } from "./src/keepAlive.js";

const port = process.env.PORT || 3000;

dbconnect(); 
startDailyEmails();
startKeepAlive(); // 🔄 Keep Render app active

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
