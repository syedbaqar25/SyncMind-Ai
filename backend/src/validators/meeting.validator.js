const { z } = require('zod');

const meetingListSchema = z.object({
  query: z.object({
    workspaceId: z.string().min(1),
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.enum(['PENDING', 'UPLOADING', 'PROCESSING', 'TRANSCRIBING', 'ANALYZING', 'COMPLETED', 'FAILED']).optional(),
    search: z.string().optional(),
    sort: z.enum(['newest', 'oldest', 'duration', 'name']).optional()
  })
});

const createMeetingSchema = z.object({
  body: z.object({
    workspaceId: z.string().min(1),
    title: z.string().min(1).max(160),
    description: z.string().max(1000).optional()
  })
});

const searchMeetingSchema = z.object({
  query: z.object({
    workspaceId: z.string().min(1),
    q: z.string().min(1)
  })
});

const meetingIdSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

const updateMeetingSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    title: z.string().min(1).max(160).optional(),
    description: z.string().max(1000).nullable().optional(),
    tags: z.array(z.object({
      name: z.string().min(1).max(40),
      color: z.string().min(4).max(20).optional()
    })).optional()
  })
});

const createActionItemSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    title: z.string().min(1).max(160),
    description: z.string().max(1000).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: z.string().datetime().nullable().optional(),
    assignees: z.array(z.string().min(1)).optional()
  })
});

const updateActionItemSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    aid: z.string().min(1)
  }),
  body: z.object({
    title: z.string().min(1).max(160).optional(),
    description: z.string().max(1000).nullable().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: z.string().datetime().nullable().optional(),
    assignees: z.array(z.string().min(1)).optional()
  })
});

const actionItemParamsSchema = z.object({
  params: z.object({
    id: z.string().min(1),
    aid: z.string().min(1)
  })
});

const askMeetingSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    question: z.string().min(1).max(1000)
  })
});

module.exports = {
  meetingListSchema,
  createMeetingSchema,
  searchMeetingSchema,
  meetingIdSchema,
  updateMeetingSchema,
  createActionItemSchema,
  updateActionItemSchema,
  actionItemParamsSchema,
  askMeetingSchema
};
