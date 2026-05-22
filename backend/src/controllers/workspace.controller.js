const sanitizeHtml = require('sanitize-html');
const { prisma } = require('../config/database');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response.utils');
const { sendEmail } = require('../services/email.service');
const { createNotification } = require('../services/notification.service');

const sanitizeText = (value) => sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();

const slugify = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

const makeUniqueSlug = async (name) => {
  const base = slugify(name) || 'workspace';
  let slug = base;
  let suffix = 1;

  while (await prisma.workspace.findUnique({ where: { slug } })) {
    suffix += 1;
    slug = `${base}-${suffix}`;
  }

  return slug;
};

const getMembership = async (workspaceId, userId) => {
  return prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } }
  });
};

const ensureRole = async (res, workspaceId, userId, allowedRoles) => {
  const membership = await getMembership(workspaceId, userId);
  if (!membership) {
    errorResponse(res, 'Workspace access denied', 403);
    return null;
  }

  if (!allowedRoles.includes(membership.role)) {
    errorResponse(res, 'Insufficient workspace permissions', 403);
    return null;
  }

  return membership;
};

const createWorkspace = async (req, res, next) => {
  try {
    const name = sanitizeText(req.body.name);
    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug: await makeUniqueSlug(name),
        logo: req.body.logo,
        ownerId: req.userId,
        members: {
          create: {
            userId: req.userId,
            role: 'OWNER'
          }
        }
      },
      include: {
        members: { include: { user: true } }
      }
    });

    return successResponse(res, workspace, 'Workspace created', 201);
  } catch (error) {
    return next(error);
  }
};

const listWorkspaces = async (req, res, next) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      where: { members: { some: { userId: req.userId } } },
      include: {
        members: { where: { userId: req.userId } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return successResponse(res, workspaces, 'Workspaces fetched');
  } catch (error) {
    return next(error);
  }
};

const getWorkspace = async (req, res, next) => {
  try {
    const membership = await getMembership(req.params.id, req.userId);
    if (!membership) return errorResponse(res, 'Workspace access denied', 403);

    const workspace = await prisma.workspace.findUnique({
      where: { id: req.params.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        }
      }
    });

    if (!workspace) return errorResponse(res, 'Workspace not found', 404);
    return successResponse(res, workspace, 'Workspace fetched');
  } catch (error) {
    return next(error);
  }
};

const updateWorkspace = async (req, res, next) => {
  try {
    const membership = await ensureRole(res, req.params.id, req.userId, ['OWNER', 'ADMIN']);
    if (!membership) return;

    const data = {};
    if (req.body.name) data.name = sanitizeText(req.body.name);
    if (Object.prototype.hasOwnProperty.call(req.body, 'logo')) data.logo = req.body.logo;

    const workspace = await prisma.workspace.update({
      where: { id: req.params.id },
      data
    });

    return successResponse(res, workspace, 'Workspace updated');
  } catch (error) {
    return next(error);
  }
};

const deleteWorkspace = async (req, res, next) => {
  try {
    const membership = await ensureRole(res, req.params.id, req.userId, ['OWNER']);
    if (!membership) return;

    const workspace = await prisma.workspace.findUnique({ where: { id: req.params.id } });
    if (!workspace) return errorResponse(res, 'Workspace not found', 404);
    if (req.body.confirmation !== workspace.name) {
      return errorResponse(res, 'Workspace name confirmation does not match', 400);
    }

    await prisma.workspace.delete({ where: { id: req.params.id } });
    return successResponse(res, null, 'Workspace deleted');
  } catch (error) {
    return next(error);
  }
};

const listMembers = async (req, res, next) => {
  try {
    const membership = await getMembership(req.params.id, req.userId);
    if (!membership) return errorResponse(res, 'Workspace access denied', 403);

    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: req.params.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
            role: true,
            createdAt: true
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });

    return successResponse(res, members, 'Members fetched');
  } catch (error) {
    return next(error);
  }
};

const inviteMember = async (req, res, next) => {
  try {
    const membership = await ensureRole(res, req.params.id, req.userId, ['OWNER', 'ADMIN']);
    if (!membership) return;

    const workspace = await prisma.workspace.findUnique({ where: { id: req.params.id } });
    if (!workspace) return errorResponse(res, 'Workspace not found', 404);

    const email = req.body.email.toLowerCase();
    await sendEmail({
      to: email,
      subject: `You're invited to ${workspace.name} on SyncMind AI`,
      html: `<p>You have been invited to join <strong>${workspace.name}</strong> on SyncMind AI.</p>`
    });

    return successResponse(res, { email }, 'Invite sent');
  } catch (error) {
    return next(error);
  }
};

const updateMemberRole = async (req, res, next) => {
  try {
    const membership = await ensureRole(res, req.params.id, req.userId, ['OWNER']);
    if (!membership) return;

    const target = await getMembership(req.params.id, req.params.uid);
    if (!target) return errorResponse(res, 'Member not found', 404);
    if (target.role === 'OWNER') return errorResponse(res, 'Cannot change owner role', 400);

    const updated = await prisma.workspaceMember.update({
      where: { id: target.id },
      data: { role: req.body.role }
    });

    await createNotification({
      userId: req.params.uid,
      title: 'Workspace role updated',
      message: `Your role in this workspace is now ${req.body.role}`,
      type: 'SYSTEM',
      metadata: { workspaceId: req.params.id }
    });

    return successResponse(res, updated, 'Member role updated');
  } catch (error) {
    return next(error);
  }
};

const removeMember = async (req, res, next) => {
  try {
    const membership = await ensureRole(res, req.params.id, req.userId, ['OWNER', 'ADMIN']);
    if (!membership) return;

    const target = await getMembership(req.params.id, req.params.uid);
    if (!target) return errorResponse(res, 'Member not found', 404);
    if (target.role === 'OWNER') return errorResponse(res, 'Cannot remove the workspace owner', 400);

    await prisma.workspaceMember.delete({ where: { id: target.id } });
    return successResponse(res, null, 'Member removed');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createWorkspace,
  listWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  listMembers,
  inviteMember,
  updateMemberRole,
  removeMember
};
