const nodemailer = require('nodemailer');

const mailEnabled = process.env.MAIL_ENABLED === 'true';
const fromEmail = process.env.MAIL_FROM || 'cleanai2026@gmail.com';

let transporter = null;
if (mailEnabled && process.env.MAIL_PASSWORD) {
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    secure: false, // true for 465, false for 587 with STARTTLS
    auth: {
      user: process.env.MAIL_USERNAME || 'cleanai2026@gmail.com',
      pass: process.env.MAIL_PASSWORD
    }
  });
}

async function sendMailAsync(options) {
  if (!mailEnabled || !transporter) {
    console.log(`[DEV EMAIL MODE] To: ${options.to} | Subject: ${options.subject} | Content:\n${options.text || options.html}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"AURA Finance" <${fromEmail}>`,
      ...options
    });
    console.log(`Email successfully dispatched to ${options.to}`);
  } catch (error) {
    console.warn(`Could not dispatch email to ${options.to}: ${error.message}. Logged notification instead.`);
  }
}

function sendEmail(to, subject, body) {
  sendMailAsync({
    to,
    subject,
    text: body
  });
}

function sendRegistrationOtpEmail(to, userName, otpCode) {
  const html = `<!DOCTYPE html>
<html><head><meta charset='utf-8'></head>
<body style='margin:0;padding:40px 10px;background-color:#0a0a0c;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;color:#e4e4e7;'>
<div style='max-width:540px;margin:0 auto;background-color:#121214;border:1px solid #27272a;border-radius:16px;padding:36px;box-shadow:0 20px 40px rgba(0,0,0,0.6);'>
<div style='margin-bottom:28px;'>
<span style='font-size:18px;font-weight:bold;letter-spacing:2px;color:#ffffff;'>&#8377; AURA FINANCE</span>
</div>
<h1 style='color:#ffffff;font-size:22px;font-weight:700;margin:0 0 12px 0;'>Verify Your Email Address</h1>
<p style='color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 24px 0;'>Hello ${userName},<br>Welcome to AURA Finance. Enter the 6-digit security code below into your verification screen to activate your private financial ledger:</p>
<div style='background:linear-gradient(135deg,#18181b,#09090b);border:1px solid #3f3f46;border-radius:12px;padding:22px;text-align:center;margin-bottom:24px;'>
<span style='font-size:36px;font-weight:900;letter-spacing:10px;color:#ffffff;font-family:monospace;'>${otpCode}</span>
</div>
<p style='color:#71717a;font-size:12px;line-height:1.5;margin:0 0 20px 0;'>This security verification code will expire in <strong>10 minutes</strong>.<br>If you did not initiate this registration request, you can safely ignore this email.</p>
<hr style='border:none;border-top:1px solid #27272a;margin:24px 0;'>
<p style='color:#52525b;font-size:11px;margin:0;font-family:monospace;'>AURA Finance &bull; End-to-End Tenancy &bull; Bank-Grade Security</p>
</div></body></html>`;

  const plainText = `Hello ${userName},\n\nYour AURA Finance 6-digit verification code is: ${otpCode}\n\nThis code will expire in 10 minutes.\n\n— The AURA Finance Team`;

  sendMailAsync({
    to,
    subject: `Your AURA verification code is ${otpCode}`,
    text: plainText,
    html
  });
}

function sendBudgetWarningEmail(to, userName, category, spent, limit, percent) {
  const subject = `AURA Alert: Budget Threshold Reached for ${category}`;
  const body = `Hello ${userName},\n\nThis is an automated notification from AURA Finance.\nYou have consumed ${percent.toFixed(1)}% of your monthly budget for '${category}'.\n\nSpent: ₹${spent}\nMonthly Limit: ₹${limit}\n\nYou can review your spending in your AURA dashboard.\n\n— The AURA Finance Team`;
  sendEmail(to, subject, body);
}

function sendBudgetExceededEmail(to, userName, category, spent, limit) {
  const subject = `AURA Alert: Budget Exceeded for ${category}`;
  const body = `Hello ${userName},\n\nUrgent Budget Alert: Your spending for '${category}' has exceeded your monthly allocation.\n\nCurrent Spent: ₹${spent}\nAllocated Limit: ₹${limit}\n\nPlease review your recent transactions in the AURA dashboard.\n\n— The AURA Finance Team`;
  sendEmail(to, subject, body);
}

function sendPasswordResetEmail(to, userName, resetLink) {
  const subject = 'AURA Finance: Password Reset Request';
  const body = `Hello ${userName},\n\nWe received a request to reset your AURA Finance account password.\nClick the link below to set a new password:\n\n${resetLink}\n\nThis link will expire in 1 hour. If you did not make this request, you can safely ignore this email.\n\n— The AURA Finance Team`;
  sendEmail(to, subject, body);
}

module.exports = {
  sendEmail,
  sendRegistrationOtpEmail,
  sendBudgetWarningEmail,
  sendBudgetExceededEmail,
  sendPasswordResetEmail
};
