
import nodemailer from "nodemailer";
// Create a Nodemailer transporter using SMTP details
// IMPORTANT: Replace the placeholder values with your actual email service credentials
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASSWORD!,
  },
});

// Function to send an email using the transporter
export const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const mailOptions = {
      from: "qosimrc.com", // Sender address
      to: to,
      subject: subject,
      text: text,
    };
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
};