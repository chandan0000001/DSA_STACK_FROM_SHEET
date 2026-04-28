import cron from "node-cron";
import UserModel from "../models/user.model.js";
import { sendEmail } from "../utils/sendEmail.utils.js";
import validator from "validator";

const DAILY_EMAIL_TIMEZONE = "Asia/Kolkata";
const DAILY_EMAIL_HOUR = 10;

function getKolkataDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: DAILY_EMAIL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getKolkataHour(date = new Date()) {
  const hourPart = new Intl.DateTimeFormat("en-GB", {
    timeZone: DAILY_EMAIL_TIMEZONE,
    hour: "2-digit",
    hour12: false,
  })
    .formatToParts(date)
    .find((part) => part.type === "hour");

  return Number(hourPart?.value ?? 0);
}

async function sendDailyEmailsForToday() {
  // Use FRONTEND_URL for email links, fallback to localhost for development
  const frontendUrl = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.replace(/\/+$/, "")
    : process.env.CLIENT_URL
    ? process.env.CLIENT_URL.replace(/\/+$/, "")
    : "http://localhost:5173";
  const todayKey = getKolkataDateKey();

  const users = await UserModel.find({
    isVerified: true,
    lastDailyEmailSentDate: { $ne: todayKey },
  });

  const validUsers = users.filter((user) => validator.isEmail(user.email));

  let successCount = 0;
  let failureCount = 0;

  for (const user of validUsers) {
    try {
      await sendEmail({
        to: user.email,
        subject: "🚀 New DSA Problems Are Ready",
        html: `
          <div style="font-family:Arial;padding:20px;">
            <h2>Hey ${user.name || "Coder"} 👋</h2>
            <p>Your daily problems are ready 🔥</p>

            <a href="${frontendUrl}/daily-problem"
               style="display:inline-block;padding:10px 15px;background:black;color:white;text-decoration:none;border-radius:6px;">
               Solve Now 🚀
            </a>

            <p style="margin-top:20px;">
              Stay consistent. Build your streak 💪
            </p>
          </div>
        `,
      });

      user.lastDailyEmailSentDate = todayKey;
      await user.save();
      successCount += 1;
    } catch (error) {
      failureCount += 1;
      console.error(`❌ Daily email failed for ${user.email}:`, error.message);
    }
  }

  console.log(
    `📩 Daily email run finished for ${todayKey}. Sent: ${successCount}, Failed: ${failureCount}`
  );
}

export const startDailyEmails = () => {
  if (getKolkataHour() >= DAILY_EMAIL_HOUR) {
    sendDailyEmailsForToday().catch((error) => {
      console.error("❌ Daily email catch-up failed:", error.message);
    });
  }

  cron.schedule(
    "0 10 * * *", //
    async () => {
      try {
        await sendDailyEmailsForToday();
      } catch (error) {
        console.error("❌ Cron error:", error.message);
      }
    },
    {
      timezone: DAILY_EMAIL_TIMEZONE,
    }
  );
};
