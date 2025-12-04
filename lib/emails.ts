import nodemailer from "nodemailer";

// Create transporter using environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface PaymentApprovedEmailProps {
  studentName: string;
  studentEmail: string;
  programName: string;
  amount: number;
  currency: string;
}

export async function sendPaymentApprovedEmail({
  studentName,
  studentEmail,
  programName,
  amount,
  currency,
}: PaymentApprovedEmailProps) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: studentEmail,
      subject: "Payment Verified - Application Approved",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #10b981;">Payment Verified Successfully</h2>
          
          <p>Dear ${studentName},</p>
          
          <p>Congratulations! Your payment for the following program has been verified:</p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Program:</strong> ${programName}</p>
            <p style="margin: 8px 0;"><strong>Amount Paid:</strong> ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
            }).format(amount)}</p>
          </div>
          
          <p>Your application is now being processed. You will receive further updates via email.</p>
          
          <p>If you have any questions, please contact our support team.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Best regards,<br/>
            Al-Itqan School Management System
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payment approved email sent to ${studentEmail}`);
  } catch (error) {
    console.error("Error sending payment approved email:", error);
    throw error;
  }
}

interface PaymentRejectedEmailProps {
  studentName: string;
  studentEmail: string;
  programName: string;
  amount: number;
  currency: string;
  reason: string;
}

export async function sendPaymentRejectedEmail({
  studentName,
  studentEmail,
  programName,
  amount,
  currency,
  reason,
}: PaymentRejectedEmailProps) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: studentEmail,
      subject: "Payment Review Required - Action Needed",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #ef4444;">Payment Requires Revision</h2>
          
          <p>Dear ${studentName},</p>
          
          <p>Your payment submission for the following program could not be verified:</p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Program:</strong> ${programName}</p>
            <p style="margin: 8px 0;"><strong>Amount:</strong> ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
            }).format(amount)}</p>
          </div>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Reason:</strong></p>
            <p style="margin: 8px 0;">${reason}</p>
          </div>
          
          <p>Please review the reason above and resubmit your payment receipt. You can do this by logging into your account and navigating to the payment submission page.</p>
          
          <p>If you believe this is an error or have questions, please contact our support team.</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Best regards,<br/>
            Al-Itqan School Management System
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payment rejected email sent to ${studentEmail}`);
  } catch (error) {
    console.error("Error sending payment rejected email:", error);
    throw error;
  }
}

interface PaymentSubmittedEmailProps {
  studentName: string;
  studentEmail: string;
  programName: string;
  amount: number;
  currency: string;
}

export async function sendPaymentSubmittedEmail({
  studentName,
  studentEmail,
  programName,
  amount,
  currency,
}: PaymentSubmittedEmailProps) {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: studentEmail,
      subject: "Payment Received - Under Review",
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <h2 style="color: #3b82f6;">Payment Receipt Received</h2>
          
          <p>Dear ${studentName},</p>
          
          <p>Thank you for submitting your payment receipt. We have received it and it is now under review:</p>
          
          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Program:</strong> ${programName}</p>
            <p style="margin: 8px 0;"><strong>Amount:</strong> ${new Intl.NumberFormat("en-US", {
              style: "currency",
              currency,
            }).format(amount)}</p>
            <p style="margin: 8px 0;"><strong>Status:</strong> Pending Verification</p>
          </div>
          
          <p>Our admin team will verify your payment within 24-48 hours. You will receive an email confirmation once your payment has been verified.</p>
          
          <p>Thank you for your patience!</p>
          
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            Best regards,<br/>
            Al-Itqan School Management System
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Payment submitted email sent to ${studentEmail}`);
  } catch (error) {
    console.error("Error sending payment submitted email:", error);
    throw error;
  }
}
