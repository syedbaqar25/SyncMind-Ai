const { Worker } = require('bullmq');
const { prisma } = require('../../config/database');
const { getRedisClient } = require('../../config/redis');
const { transcribeAudioFromUrl } = require('../../services/ai/transcription.service');
const { summarizeTranscript, extractKeyTopics, analyzeSentiment } = require('../../services/ai/summarization.service');
const { extractActionItems } = require('../../services/ai/actionItems.service');
const { vectorizeTranscript } = require('../../services/ai/embedding.service');
const { sendEmail } = require('../../services/email.service');
const logger = require('../../utils/logger');

const getIo = () => {
  try {
    const socket = require('../../socket');
    return socket.getIO ? socket.getIO() : socket.io;
  } catch (error) {
    return {
      to: () => ({
        emit: () => {}
      })
    };
  }
};

const emitWorkspace = (workspaceId, event, payload) => {
  getIo().to(`workspace:${workspaceId}`).emit(event, payload);
};

const emitUser = (userId, event, payload) => {
  getIo().to(`user:${userId}`).emit(event, payload);
};

const updateMeetingStatus = async ({ meetingId, workspaceId, status, event = 'meeting:processing' }) => {
  await prisma.meeting.update({ where: { id: meetingId }, data: { status } });
  emitWorkspace(workspaceId, event, { meetingId, status });
};

const processMeeting = async (job) => {
  const { meetingId, audioUrl, workspaceId } = job.data;

  try {
    await updateMeetingStatus({ meetingId, workspaceId, status: 'PROCESSING' });

    await updateMeetingStatus({ meetingId, workspaceId, status: 'TRANSCRIBING' });
    const transcription = await transcribeAudioFromUrl({ meetingId, audioUrl });
    const segments = transcription.segments || [];

    // Delete existing transcript if retry
await prisma.transcriptSegment.deleteMany({ where: { transcript: { meetingId } } })
await prisma.transcript.deleteMany({ where: { meetingId } })

const transcript = await prisma.transcript.create({
      data: {
        meetingId,
        fullText: transcription.text,
        language: transcription.language || 'en',
        segments: {
          create: segments.map((segment) => ({
            text: segment.text,
            startTime: segment.start,
            endTime: segment.end,
            speaker: segment.speaker,
            confidence: segment.avg_logprob ? Math.exp(segment.avg_logprob) : null
          }))
        }
      }
    });

    const lastSegment = segments[segments.length - 1];
    if (lastSegment?.end) {
      await prisma.meeting.update({
        where: { id: meetingId },
        data: { duration: Math.ceil(lastSegment.end) }
      });
    }

    await updateMeetingStatus({ meetingId, workspaceId, status: 'ANALYZING' });
    const [summary, actionItems, keyTopics, sentiment] = await Promise.all([
      summarizeTranscript(transcription.text),
      extractActionItems(transcription.text),
      extractKeyTopics(transcription.text),
      analyzeSentiment(transcription.text)
    ]);

    await prisma.transcript.update({
      where: { meetingId },
      data: { summary, keyTopics, sentiment }
    });

    const createdActionItems = await Promise.all(
      actionItems.map((item) =>
        prisma.actionItem.create({
          data: {
            meetingId,
            title: item.title,
            description: item.description,
            priority: item.priority,
            dueDate: item.dueDate ? new Date(item.dueDate) : null
          }
        })
      )
    );

    emitWorkspace(workspaceId, 'meeting:transcribed', { meetingId });

    await vectorizeTranscript({
      meetingId,
      workspaceId,
      fullText: transcription.text
    });

    const meeting = await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'COMPLETED' },
      include: {
        participants: true
      }
    });

    const participantIds = new Set(meeting.participants.map((participant) => participant.userId));
    participantIds.add(meeting.uploadedById);

    for (const userId of participantIds) {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title: 'Meeting Ready',
          message: `"${meeting.title}" has been processed`,
          type: 'MEETING_READY',
          metadata: { meetingId }
        }
      });
      emitUser(userId, 'notification:new', { notification });
    }

    const owner = await prisma.user.findUnique({ where: { id: meeting.uploadedById } });
    if (owner?.email) {
      try {
        const firstParagraph = summary.split(/\n\s*\n/)[0] || summary;
        await sendEmail({
          to: owner.email,
          subject: `Meeting ready: ${meeting.title}`,
          html: `
            <h1>${meeting.title}</h1>
            <p>${new Date(meeting.createdAt).toLocaleString()}</p>
            <p>Duration: ${meeting.duration || 0} seconds</p>
            <p>${firstParagraph}</p>
            <ul>${createdActionItems.map((item) => `<li>${item.title} (${item.priority})</li>`).join('')}</ul>
            <p><a href="${process.env.FRONTEND_URL}/meetings/${meeting.id}">Open meeting</a></p>
          `
        });
      } catch (emailError) {
        logger.warn('Meeting ready email could not be sent', {
          meetingId,
          email: owner.email,
          error: emailError.message
        });
      }
    }

    emitWorkspace(workspaceId, 'meeting:completed', {
      meetingId,
      summary,
      actionItemsCount: createdActionItems.length,
      keyTopics
    });

    return { meetingId, transcriptId: transcript.id };
  } catch (error) {
    await prisma.meeting.update({
      where: { id: meetingId },
      data: { status: 'FAILED', processingError: error.message }
    });
    emitWorkspace(workspaceId, 'meeting:failed', { meetingId, error: error.message });
    throw error;
  }
};

let worker;

const startMeetingWorker = () => {
  if (worker) return worker;

  worker = new Worker('meeting-processing', processMeeting, {
    connection: getRedisClient(),
    concurrency: 1
  });

  worker.on('completed', (job) => logger.info('Meeting job completed', { jobId: job.id }));
  worker.on('failed', (job, error) => {
    logger.error('Meeting job failed', { jobId: job?.id, error: error.message });
  });

  return worker;
};

module.exports = {
  processMeeting,
  startMeetingWorker
};
