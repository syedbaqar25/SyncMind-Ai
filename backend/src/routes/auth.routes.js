const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate.middleware');
const { authenticate } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');
const {
  registerSchema,
  loginSchema,
  tokenBodySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema
} = require('../validators/auth.validator');

const router = express.Router();

// Apply rate limiter to password/email routes only — NOT Google OAuth
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/logout', validate(tokenBodySchema), authController.logout);
router.post('/refresh', validate(tokenBodySchema), authController.refresh);
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);
router.get('/verify-email/:token', validate(verifyEmailSchema), authController.verifyEmail);

// Google OAuth — NO rate limiter on these
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'], session: false }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=oauth` }),
  authController.googleCallback
);

router.get('/me', authenticate, authController.me);

module.exports = router;
