import nodemailer from 'nodemailer'; 

const transpoter = nodemailer.createTransport({
    service:"gmail", 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }, 

})

export const sendEmail = async ({ to, subject, html }) => {
    try {
        await transpoter.sendMail({
            from: `"DSA Tracker 🚀" <${process.env.EMAIL_USER}>`, 
            to,
            subject,
            html,
        })

    } catch (error) {
        console.error("Email error:", error.message);
        throw error;
    }
}
