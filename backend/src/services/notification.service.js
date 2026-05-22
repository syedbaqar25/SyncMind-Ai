const { prisma } = require('../config/database');

const createNotification = async ({ userId, title, message, type = 'SYSTEM', metadata = undefined }) => {
  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      metadata
    }
  });
};

const notifyWorkspaceMembers = async ({ workspaceId, title, message, type = 'SYSTEM', metadata }) => {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true }
  });

  return Promise.all(
    members.map((member) =>
      createNotification({
        userId: member.userId,
        title,
        message,
        type,
        metadata
      })
    )
  );
};

module.exports = {
  createNotification,
  notifyWorkspaceMembers
};
