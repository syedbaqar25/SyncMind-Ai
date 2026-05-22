const { z } = require('zod');

const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    avatar: z.string().url().nullable().optional()
  })
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8).max(128)
  })
});

const notificationIdSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

module.exports = {
  updateProfileSchema,
  changePasswordSchema,
  notificationIdSchema
};
