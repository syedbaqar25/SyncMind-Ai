const { Resend } = require('resend');
const logger = require('../utils/logger');

const getClient = () => new Resend(process.env.RESEND_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  const from = process.env.FROM_EMAIL || 'onboarding@resend.dev';
  try {
    return await getClient().emails.send({ from, to, subject, html });
  } catch (error) {
    logger.error('Email send failed', { to, subject, error: error.message });
    throw error;
  }
};

const sendVerificationEmail = async ({ to, name, token }) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  return sendEmail({
    to,
    subject: 'Verify your SyncMind AI account',
    html: `
      <div style="font-family:Arial,sans-serif;color:#111827">
        <h1>Welcome to SyncMind AI, ${name}</h1>
        <p>Verify your email address to finish setting up your account.</p>
        <p><a href="${verifyUrl}" style="background:#6366f1;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Verify email</a></p>
      </div>
    `
  });
};

const sendPasswordResetEmail = async ({ to, name, token }) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
  return sendEmail({
    to,
    subject: 'Reset your SyncMind AI password',
    html: `
      <div style="font-family:Arial,sans-serif;color:#111827">
        <h1>Password reset requested</h1>
        <p>Hi ${name}, use the link below within 15 minutes to reset your password.</p>
        <p><a href="${resetUrl}" style="background:#6366f1;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none">Reset password</a></p>
      </div>
    `
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
};
