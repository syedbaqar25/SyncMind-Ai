const sanitizeHtml = require('sanitize-html');
const { prisma } = require('../config/database');
const { successResponse, paginatedResponse, errorResponse } = require('../utils/response.utils');
const { uploadMeetingFile, deleteCloudinaryAsset } = require('../services/cloudinary.service');
const { deleteMeetingVectors } = require('../services/ai/embedding.service');
const logger = require('../utils/logger');

const sanitizeText = (value) =>
  value === null || value === undefined
    ? value
    : sanitizeHtml(String(value), { allowedTags: [], allowedAttributes: {} }).trim();

const getMembership = async (workspaceId, userId) => {
  return prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } }
  });
};

const ensureWorkspaceMember = async (res, workspaceId, userId) => {
  const membership = await getMembership(workspaceId, userId);
  if (!membership) {
    errorResponse(res, 'Workspace access denied', 403);
    return null;
  }
  return membership;
};

const getMeetingForUser = async (meetingId, userId, include = {}) => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      workspace: { include: { members: { where: { userId } } } },
      ...include
    }
  });

  if (!meeting) return { meeting: null, status: 404 };
  if (!meeting.workspace.members.length) return { meeting: null, status: 403 };

  delete meeting.workspace.members;
  return { meeting, status: 200 };
};

const enqueueMeetingJob = async (payload) => {
  try {
    const { meetingProcessorQueue } = require('../queues/meetingProcessor.queue');
    await meetingProcessorQueue.add('process-meeting', payload);
  } catch (error) {
    logger.warn('Meeting job could not be enqueued yet', {
      meetingId: payload.meetingId,
      error: error.message
    });
  }
};

const listMeetings = async (req, res, next) => {
  try {
    const membership = await ensureWorkspaceMember(res, req.query.workspaceId, req.userId);
    if (!membership) return;

    const page = Math.max(Number(req.query.page || 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit || 12), 1), 100);
    const skip = (page - 1) * limit;
    const where = {
      workspaceId: req.query.workspaceId,
      ...(req.query.status ? { status: req.query.status } : {}),
      ...(req.query.search
        ? { title: { contains: req.query.search, mode: 'insensitive' } }
        : {})
    };

    const sort = req.query.sort || 'newest';
    const orderBy =
      sort === 'oldest'
        ? { createdAt: 'asc' }
        : sort === 'duration'
          ? { duration: 'desc' }
          : sort === 'name'
            ? { title: 'asc' }
            : { createdAt: 'desc' };

    const [meetings, total] = await Promise.all([
      prisma.meeting.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          participants: { include: { user: { select: { id: true, name: true, avatar: true } } } },
          actionItems: { select: { id: true, status: true } },
          tags: { include: { tag: true } }
        }
      }),
      prisma.meeting.count({ where })
    ]);

    return paginatedResponse(res, meetings, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }, 'Meetings fetched');
  } catch (error) {
    return next(error);
  }
};

const createMeeting = async (req, res, next) => {
  try {
    const membership = await ensureWorkspaceMember(res, req.body.workspaceId, req.userId);
    if (!membership) return;
    if (!req.file) return errorResponse(res, 'Meeting audio or video file is required', 400);

    const uploadResult = await uploadMeetingFile(req.file);
    const isVideo = req.file.mimetype.startsWith('video/');

    const meeting = await prisma.meeting.create({
      data: {
        title: sanitizeText(req.body.title),
        description: sanitizeText(req.body.description),
        workspaceId: req.body.workspaceId,
        uploadedById: req.userId,
        audioUrl: isVideo ? null : uploadResult.secure_url,
        videoUrl: isVideo ? uploadResult.secure_url : null,
        cloudinaryId: uploadResult.public_id,
        duration: uploadResult.duration ? Math.round(uploadResult.duration) : null,
        status: 'PROCESSING',
        participants: {
          create: {
            userId: req.userId
          }
        }
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true, avatar: true } } } }
      }
    });

    await enqueueMeetingJob({
      meetingId: meeting.id,
      audioUrl: meeting.audioUrl || meeting.videoUrl,
      workspaceId: meeting.workspaceId
    });

    return successResponse(res, meeting, 'Meeting uploaded', 201);
  } catch (error) {
    return next(error);
  }
};

const searchMeetings = async (req, res, next) => {
  try {
    const membership = await ensureWorkspaceMember(res, req.query.workspaceId, req.userId);
    if (!membership) return;

    const meetings = await prisma.meeting.findMany({
      where: {
        workspaceId: req.query.workspaceId,
        OR: [
          { title: { contains: req.query.q, mode: 'insensitive' } },
          { transcript: { fullText: { contains: req.query.q, mode: 'insensitive' } } }
        ]
      },
      include: { transcript: true, actionItems: true },
      take: 20
    });

    return successResponse(res, meetings, 'Search results fetched');
  } catch (error) {
    return next(error);
  }
};

const getMeeting = async (req, res, next) => {
  try {
    const result = await getMeetingForUser(req.params.id, req.userId, {
      transcript: { include: { segments: true } },
      actionItems: { include: { assignees: { include: { user: { select: { id: true, name: true, avatar: true } } } } } },
      participants: { include: { user: { select: { id: true, name: true, email: true, avatar: true } } } },
      tags: { include: { tag: true } }
    });

    if (!result.meeting) {
      return errorResponse(res, result.status === 403 ? 'Workspace access denied' : 'Meeting not found', result.status);
    }

    return successResponse(res, result.meeting, 'Meeting fetched');
  } catch (error) {
    return next(error);
  }
};

const updateMeeting = async (req, res, next) => {
  try {
    const result = await getMeetingForUser(req.params.id, req.userId);
    if (!result.meeting) {
      return errorResponse(res, result.status === 403 ? 'Workspace access denied' : 'Meeting not found', result.status);
    }

    const data = {};
    if (req.body.title) data.title = sanitizeText(req.body.title);
    if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
      data.description = sanitizeText(req.body.description);
    }

    if (req.body.tags) {
      await prisma.meetingTag.deleteMany({ where: { meetingId: req.params.id } });
      for (const tagInput of req.body.tags) {
        const tag = await prisma.tag.create({
          data: {
            name: sanitizeText(tagInput.name),
            color: tagInput.color || '#6366f1'
          }
        });
        await prisma.meetingTag.create({ data: { meetingId: req.params.id, tagId: tag.id } });
      }
    }

    const meeting = await prisma.meeting.update({
      where: { id: req.params.id },
      data,
      include: { tags: { include: { tag: true } } }
    });

    return successResponse(res, meeting, 'Meeting updated');
  } catch (error) {
    return next(error);
  }
};

const deleteMeeting = async (req, res, next) => {
  try {
    const result = await getMeetingForUser(req.params.id, req.userId);
    if (!result.meeting) {
      return errorResponse(res, result.status === 403 ? 'Workspace access denied' : 'Meeting not found', result.status);
    }

    await deleteCloudinaryAsset(result.meeting.cloudinaryId);
    await deleteMeetingVectors(result.meeting.id).catch((error) => {
      logger.warn('Meeting vectors could not be deleted', { meetingId: result.meeting.id, error: error.message });
    });
    await prisma.meeting.delete({ where: { id: req.params.id } });
    return successResponse(res, null, 'Meeting deleted');
  } catch (error) {
    return next(error);
  }
};

const processMeeting = async (req, res, next) => {
  try {
    const result = await getMeetingForUser(req.params.id, req.userId);
    if (!result.meeting) {
      return errorResponse(res, result.status === 403 ? 'Workspace access denied' : 'Meeting not found', result.status);
    }

    await prisma.transcriptSegment.deleteMany({ where: { transcript: { meetingId: req.params.id } } });
    await prisma.transcript.deleteMany({ where: { meetingId: req.params.id } });
    await prisma.actionItem.deleteMany({ where: { meetingId: req.params.id } });

    const meeting = await prisma.meeting.update({
      where: { id: req.params.id },
      data: { status: 'PENDING', processingError: null }
    });

    await enqueueMeetingJob({
      meetingId: meeting.id,
      audioUrl: meeting.audioUrl || meeting.videoUrl,
      workspaceId: meeting.workspaceId
    });

    return successResponse(res, meeting, 'Meeting processing queued');
  } catch (error) {
    return next(error);
  }
};

const getTranscript = async (req, res, next) => {
  try {
    const result = await getMeetingForUser(req.params.id, req.userId, {
      transcript: { include: { segments: true } }
    });
    if (!result.meeting) {
      return errorResponse(res, result.status === 403 ? 'Workspace access denied' : 'Meeting not found', result.status);
    }
    if (!result.meeting.transcript) return errorResponse(res, 'Transcript not found', 404);

    return successResponse(res, result.meeting.transcript, 'Transcript fetched');
  } catch (error) {
    return next(error);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const result = await getMeetingForUser(req.params.id, req.userId, { transcript: true });
    if (!result.meeting) {
      return errorResponse(res, result.status === 403 ? 'Workspace access denied' : 'Meeting not found', result.status);
    }
    if (!result.meeting.transcript?.summary) return errorResponse(res, 'Summary not found', 404);

    return successResponse(res, { summary: result.meeting.transcript.summary }, 'Summary fetched');
  } catch (error) {
    return next(error);
  }
};

const listActionItems = async (req, res, next) => {
  try {
    const result = await getMeetingForUser(req.params.id, req.userId);
    if (!result.meeting) {
      return errorResponse(res, result.status === 403 ? 'Workspace access denied' : 'Meeting not found', result.status);
    }

    const actionItems = await prisma.actionItem.findMany({
      where: { meetingId: req.params.id },
      include: { assignees: { include: { user: { select: { id: true, name: true, avatar: true } } } } }
    });

    return successResponse(res, actionItems, 'Action items fetched');
  } catch (error) {
    return next(error);
  }
};

const createActionItem = async (req, res, next) => {
  try {
    const result = await getMeetingForUser(req.params.id, req.userId);
    if (!result.meeting) {
      return errorResponse(res, result.status === 403 ? 'Workspace access denied' : 'Meeting not found', result.status);
    }

    const actionItem = await prisma.actionItem.create({
      data: {
        meetingId: req.params.id,
        title: sanitizeText(req.body.title),
        description: sanitizeText(req.body.description),
        priority: req.body.priority || 'MEDIUM',
        dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        assignees: {
          create: (req.body.assignees || []).map((userId) => ({ userId }))
        }
      },
      include: { assignees: { include: { user: { select: { id: true, name: true, avatar: true } } } } }
    });

    return successResponse(res, actionItem, 'Action item created', 201);
  } catch (error) {
    return next(error);
  }
};

const updateActionItem = async (req, res, next) => {
  try {
    const result = await getMeetingForUser(req.params.id, req.userId);
    if (!result.meeting) {
      return errorResponse(res, result.status === 403 ? 'Workspace access denied' : 'Meeting not found', result.status);
    }

    const existing = await prisma.actionItem.findFirst({
      where: { id: req.params.aid, meetingId: req.params.id }
    });
    if (!existing) return errorResponse(res, 'Action item not found', 404);

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
      await prisma.actionItemAssignee.deleteMany({ where: { actionItemId: req.params.aid } });
      data.assignees = { create: req.body.assignees.map((userId) => ({ userId })) };
    }

    const actionItem = await prisma.actionItem.update({
      where: { id: req.params.aid },
      data,
      include: { assignees: { include: { user: { select: { id: true, name: true, avatar: true } } } } }
    });

    return successResponse(res, actionItem, 'Action item updated');
  } catch (error) {
    return next(error);
  }
};

const deleteActionItem = async (req, res, next) => {
  try {
    const result = await getMeetingForUser(req.params.id, req.userId);
    if (!result.meeting) {
      return errorResponse(res, result.status === 403 ? 'Workspace access denied' : 'Meeting not found', result.status);
    }

    const existing = await prisma.actionItem.findFirst({
      where: { id: req.params.aid, meetingId: req.params.id }
    });
    if (!existing) return errorResponse(res, 'Action item not found', 404);

    await prisma.actionItem.delete({ where: { id: req.params.aid } });
    return successResponse(res, null, 'Action item deleted');
  } catch (error) {
    return next(error);
  }
};

const askMeeting = async (req, res, next) => {
  try {
    const result = await getMeetingForUser(req.params.id, req.userId, { transcript: true });
    if (!result.meeting) {
      return errorResponse(res, result.status === 403 ? 'Workspace access denied' : 'Meeting not found', result.status);
    }

    const question = sanitizeText(req.body.question);
    if (!question) return errorResponse(res, 'Question is required', 400);

    try {
      const { createEmbedding, getPineconeIndex } = require('../services/ai/embedding.service');
      const { GoogleGenerativeAI } = require('@google/generative-ai');

      // Step 1: Embed the question
      const questionEmbedding = await createEmbedding(question);

      // Step 2: Query Pinecone for relevant chunks
      const index = getPineconeIndex();
      const queryResult = await index.query({
        vector: questionEmbedding,
        topK: 3,
        includeMetadata: true,
        filter: { meetingId: req.params.id }
      });

      const matches = queryResult.matches || [];

      if (!matches.length) {
        return successResponse(res, {
          question,
          answer: 'This meeting has not been indexed for Q&A yet. Please wait for processing to complete or retry the meeting.'
        }, 'Question received');
      }

      // Step 3: Build context from matched chunks
      const context = matches
        .map((match) => match.metadata?.text || '')
        .filter(Boolean)
        .join('\n\n');

      // Step 4: Generate answer using Gemini
      const genAI = new GoogleGenerativeAI(
        process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY
      );
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const prompt = `You are an AI meeting assistant. Answer the user's question based ONLY on the meeting transcript context provided below. If the answer is not in the context, say "I couldn't find that information in this meeting."

MEETING CONTEXT:
${context}

QUESTION: ${question}

Provide a clear, concise answer:`;

      const genResult = await model.generateContent(prompt);
      const answer = genResult.response.text().trim();

      return successResponse(res, { question, answer }, 'Question answered');
    } catch (qaError) {
      logger.warn('Q&A failed, falling back to transcript-based answer', {
        meetingId: req.params.id,
        error: qaError.message
      });

      // Fallback: if embeddings/Pinecone fail, use the raw transcript with Gemini
      if (result.meeting.transcript?.fullText) {
        try {
          const { GoogleGenerativeAI } = require('@google/generative-ai');
          const genAI = new GoogleGenerativeAI(
            process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY
          );
          const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

          const truncatedText = result.meeting.transcript.fullText.slice(0, 8000);
          const fallbackPrompt = `Answer this question about a meeting based on the transcript below. If the answer is not in the transcript, say so.

TRANSCRIPT:
${truncatedText}

QUESTION: ${question}

Answer:`;

          const fallbackResult = await model.generateContent(fallbackPrompt);
          return successResponse(res, {
            question,
            answer: fallbackResult.response.text().trim()
          }, 'Question answered (fallback)');
        } catch {
          // If even fallback fails, return a helpful message
        }
      }

      return successResponse(res, {
        question,
        answer: 'Sorry, I could not process your question right now. Please try again later.'
      }, 'Question received');
    }
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  listMeetings,
  createMeeting,
  searchMeetings,
  getMeeting,
  updateMeeting,
  deleteMeeting,
  processMeeting,
  getTranscript,
  getSummary,
  listActionItems,
  createActionItem,
  updateActionItem,
  deleteActionItem,
  askMeeting
};
