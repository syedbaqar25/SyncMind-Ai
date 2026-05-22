const { z } = require('zod');

const taskListSchema = z.object({
  query: z.object({
    workspaceId: z.string().min(1),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']).optional(),
    assignee: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    meetingId: z.string().optional()
  })
});

const taskIdSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  })
});

const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().min(1)
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

module.exports = {
  taskListSchema,
  taskIdSchema,
  updateTaskSchema
};
