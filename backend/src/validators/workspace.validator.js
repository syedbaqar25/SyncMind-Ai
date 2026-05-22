const { z } = require('zod');

const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(80),
    logo: z.string().url().optional()
  })
});

const workspaceIdSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

const updateWorkspaceSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    name: z.string().min(2).max(80).optional(),
    logo: z.string().url().nullable().optional()
  })
});

const deleteWorkspaceSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    confirmation: z.string().min(1)
  })
});

const inviteSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    email: z.string().email()
  })
});

const updateMemberSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    uid: z.string().min(1)
  }),
  body: z.object({
    role: z.enum(['ADMIN', 'MEMBER', 'VIEWER'])
  })
});

const memberParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    uid: z.string().min(1)
  })
});

module.exports = {
  createWorkspaceSchema,
  workspaceIdSchema,
  updateWorkspaceSchema,
  deleteWorkspaceSchema,
  inviteSchema,
  updateMemberSchema,
  memberParamsSchema
};
