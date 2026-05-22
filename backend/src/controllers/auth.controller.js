const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sanitizeHtml = require('sanitize-html');
const { prisma } = require('../config/database');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken
} = require('../utils/jwt.utils');
const { hashPassword, comparePassword, stripUserSecrets } = require('../utils/auth.utils');
const { successResponse, errorResponse } = require('../utils/response.utils');
const {
  sendVerificationEmail,
  sendPasswordResetEmail
} = require('../services/email.service');
const logger = require('../utils/logger');

const sanitizeText = (value) => sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();

const getRefreshExpiry = () => {
  const token = generateRefreshToken('expiry-probe');
  const decoded = jwt.decode(token);
  return new Date(decoded.exp * 1000);
};

const issueTokens = async (userId) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  await prisma.refreshToken.create({
    data: {
      token: hashToken(refreshToken),
      userId,
      expiresAt: getRefreshExpiry()
    }
  });

  return { accessToken, refreshToken };
};

const register = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    const name = sanitizeText(req.body.name);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return errorResponse(res, 'Email already registered', 409);

    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: await hashPassword(req.body.password),
        emailVerifyToken
      }
    });

    try {
      await sendVerificationEmail({ to: email, name, token: emailVerifyToken });
    } catch (error) {
      logger.warn('Verification email could not be sent', { email, error: error.message });
    }

    return successResponse(res, stripUserSecrets(user), 'Registration successful', 201);
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) return errorResponse(res, 'Invalid credentials', 401);

    const passwordMatches = await comparePassword(req.body.password, user.password);
    if (!passwordMatches) return errorResponse(res, 'Invalid credentials', 401);

    if (!user.isEmailVerified) return errorResponse(res, 'Email is not verified', 403);

    const tokens = await issueTokens(user.id);
    return successResponse(res, { ...tokens, user: stripUserSecrets(user) }, 'Login successful');
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    await prisma.refreshToken.deleteMany({ where: { token: hashToken(refreshToken) } });
    return successResponse(res, null, 'Logged out');
  } catch (error) {
    return next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const payload = verifyRefreshToken(refreshToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { token: hashToken(refreshToken) }
    });

    if (!stored || stored.expiresAt < new Date()) {
      return errorResponse(res, 'Invalid refresh token', 401);
    }

    await prisma.refreshToken.delete({ where: { id: stored.id } });
    const tokens = await issueTokens(payload.userId);
    return successResponse(res, tokens, 'Token refreshed');
  } catch (error) {
    return errorResponse(res, 'Invalid refresh token', 401);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const email = req.body.email.toLowerCase();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const passwordResetToken = crypto.randomBytes(32).toString('hex');
      await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken,
          passwordResetExpiry: new Date(Date.now() + 15 * 60 * 1000)
        }
      });

      try {
        await sendPasswordResetEmail({ to: email, name: user.name, token: passwordResetToken });
      } catch (error) {
        logger.warn('Password reset email could not be sent', { email, error: error.message });
      }
    }

    return successResponse(res, null, 'If the email exists, a reset link has been sent');
  } catch (error) {
    return next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: req.body.token,
        passwordResetExpiry: { gt: new Date() }
      }
    });

    if (!user) return errorResponse(res, 'Invalid or expired reset token', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: await hashPassword(req.body.password),
        passwordResetToken: null,
        passwordResetExpiry: null
      }
    });

    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    return successResponse(res, null, 'Password reset successful');
  } catch (error) {
    return next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: req.params.token }
    });

    if (!user) return errorResponse(res, 'Invalid verification token', 400);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null
      }
    });

    return successResponse(res, null, 'Email verified');
  } catch (error) {
    return next(error);
  }
};

const googleCallback = async (req, res, next) => {
  try {
    const tokens = await issueTokens(req.user.id);
    return successResponse(res, { ...tokens, user: stripUserSecrets(req.user) }, 'Google login successful');
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res) => {
  return successResponse(res, req.user, 'Current user');
};

module.exports = {
  register,
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  verifyEmail,
  googleCallback,
  me,
  issueTokens
};
