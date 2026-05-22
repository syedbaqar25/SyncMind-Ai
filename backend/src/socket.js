const { Server } = require('socket.io');
const { prisma } = require('./config/database');
const { verifyAccessToken } = require('./utils/jwt.utils');
const logger = require('./utils/logger');

let io;

const noopIo = {
  to: () => ({
    emit: () => {}
  })
};

const isWorkspaceMember = async (workspaceId, userId) => {
  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } }
  });
  return Boolean(membership);
};

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true
    }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;
      return next();
    } catch (error) {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);

    socket.on('join:workspace', async ({ workspaceId }, callback) => {
      try {
        if (!(await isWorkspaceMember(workspaceId, socket.userId))) {
          return callback?.({ success: false, message: 'Workspace access denied' });
        }

        socket.join(`workspace:${workspaceId}`);
        return callback?.({ success: true });
      } catch (error) {
        return callback?.({ success: false, message: error.message });
      }
    });

    socket.on('leave:workspace', ({ workspaceId }, callback) => {
      socket.leave(`workspace:${workspaceId}`);
      return callback?.({ success: true });
    });

    socket.on('join:meeting', async ({ meetingId }, callback) => {
      try {
        const meeting = await prisma.meeting.findUnique({ where: { id: meetingId } });
        if (!meeting || !(await isWorkspaceMember(meeting.workspaceId, socket.userId))) {
          return callback?.({ success: false, message: 'Meeting access denied' });
        }

        socket.join(`meeting:${meetingId}`);
        return callback?.({ success: true });
      } catch (error) {
        return callback?.({ success: false, message: error.message });
      }
    });

    socket.on('task:move', async ({ taskId, newStatus }, callback) => {
      try {
        const task = await prisma.actionItem.findUnique({
          where: { id: taskId },
          include: { meeting: true }
        });

        if (!task || !(await isWorkspaceMember(task.meeting.workspaceId, socket.userId))) {
          return callback?.({ success: false, message: 'Task access denied' });
        }

        const updated = await prisma.actionItem.update({
          where: { id: taskId },
          data: { status: newStatus }
        });

        io.to(`workspace:${task.meeting.workspaceId}`).emit('task:updated', {
          taskId,
          changes: { status: updated.status }
        });

        return callback?.({ success: true, data: updated });
      } catch (error) {
        logger.error('Socket task move failed', { error: error.message });
        return callback?.({ success: false, message: error.message });
      }
    });
  });

  return io;
};

const getIO = () => io || noopIo;

module.exports = {
  initSocket,
  getIO
};
