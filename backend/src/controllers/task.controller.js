const sanitizeHtml = require('sanitize-html');
const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response.utils');
const { getIO } = require('../socket');

const sanitizeText = (value) =>
  value === null || value === undefined
    ? value
    : sanitizeHtml(String(value), { allowedTags: [], allowedAttributes: {} }).trim();

const isWorkspaceMember = async (workspaceId, userId) => {
  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } }
  });
  return Boolean(membership);
};

const getTaskForUser = async (taskId, userId) => {
  const task = await prisma.actionItem.findUnique({
    where: { id: taskId },
    include: {
      meeting: true,
      assignees: { include: { user: { select: { id: true, name: true, avatar: true } } } }
    }
  });

  if (!task) return { task: null, status: 404 };
  if (!(await isWorkspaceMember(task.meeting.workspaceId, userId))) return { task: null, status: 403 };
  return { task, status: 200 };
};

const listTasks = async (req, res, next) => {
  try {
    if (!(await isWorkspaceMember(req.query.workspaceId, req.userId))) {
      return errorResponse(res, 'Workspace access denied', 403);
    }

    const tasks = await prisma.actionItem.findMany({
      where: {
        meeting: { workspaceId: req.query.workspaceId },
        ...(req.query.status ? { status: req.query.status } : {}),
        ...(req.query.priority ? { priority: req.query.priority } : {}),
        ...(req.query.meetingId ? { meetingId: req.query.meetingId } : {}),
        ...(req.query.assignee ? { assignees: { some: { userId: req.query.assignee } } } : {})
      },
      include: {
        meeting: { select: { id: true, title: true, workspaceId: true } },
        assignees: { include: { user: { select: { id: true, name: true, avatar: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, tasks, 'Tasks fetched');
  } catch (error) {
    return next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const result = await getTaskForUser(req.params.id, req.userId);
    if (!result.task) {
      return errorResponse(res, result.status === 403 ? 'Workspace access denied' : 'Task not found', result.status);
    }

    const data = {};
    ['title', 'description'].forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) data[key] = sanitizeText(req.body[key]);
    });
    ['status', 'priority'].forEach((key) => {
      if (req.body[key]) data[key] = req.body[key];
    });
    if (Object.prototype.hasOwnProperty.call(req.body, 'dueDate')) {
      data.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;
    }

    if (req.body.assignees) {
      await prisma.actionItemAssignee.deleteMany({ where: { actionItemId: req.params.id } });
      data.assignees = { create: req.body.assignees.map((userId) => ({ userId })) };
    }

    const task = await prisma.actionItem.update({
      where: { id: req.params.id },
      data,
      include: {
        meeting: { select: { id: true, title: true, workspaceId: true } },
        assignees: { include: { user: { select: { id: true, name: true, avatar: true } } } }
      }
    });

    getIO().to(`workspace:${task.meeting.workspaceId}`).emit('task:updated', {
      taskId: task.id,
      changes: data
    });

    return successResponse(res, task, 'Task updated');
  } catch (error) {
    return next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const result = await getTaskForUser(req.params.id, req.userId);
    if (!result.task) {
      return errorResponse(res, result.status === 403 ? 'Workspace access denied' : 'Task not found', result.status);
    }

    await prisma.actionItem.delete({ where: { id: req.params.id } });
    getIO().to(`workspace:${result.task.meeting.workspaceId}`).emit('task:updated', {
      taskId: req.params.id,
      changes: { deleted: true }
    });

    return successResponse(res, null, 'Task deleted');
  } catch (error) {
    return next(error);
  }
};

const myTasks = async (req, res, next) => {
  try {
    const tasks = await prisma.actionItem.findMany({
      where: { assignees: { some: { userId: req.userId } } },
      include: {
        meeting: { select: { id: true, title: true, workspaceId: true } },
        assignees: { include: { user: { select: { id: true, name: true, avatar: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return successResponse(res, tasks, 'My tasks fetched');
  } catch (error) {
    return next(error);
  }
};

const overdueTasks = async (req, res, next) => {
  try {
    if (!(await isWorkspaceMember(req.query.workspaceId, req.userId))) {
      return errorResponse(res, 'Workspace access denied', 403);
    }

    const tasks = await prisma.actionItem.findMany({
      where: {
        meeting: { workspaceId: req.query.workspaceId },
        dueDate: { lt: new Date() },
        status: { not: 'DONE' }
      },
      include: {
        meeting: { select: { id: true, title: true, workspaceId: true } },
        assignees: { include: { user: { select: { id: true, name: true, avatar: true } } } }
      }
    });

    return successResponse(res, tasks, 'Overdue tasks fetched');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listTasks,
  updateTask,
  deleteTask,
  myTasks,
  overdueTasks
};
