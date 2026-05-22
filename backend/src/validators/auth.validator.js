const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    name: z.string().min(2).max(80),
    password: z.string().min(8).max(128)
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
});

const tokenBodySchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1)
  })
});

const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email()
  })
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8).max(128)
  })
});

const verifyEmailSchema = z.object({
  params: z.object({
    token: z.string().min(1)
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  tokenBodySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema
};
