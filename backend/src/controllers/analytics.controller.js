const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/response.utils');

const isWorkspaceMember = async (workspaceId, userId) => {
  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } }
  });
  return Boolean(membership);
};

const requireWorkspace = async (req, res) => {
  const workspaceId = req.query.workspaceId;
  if (!workspaceId) {
    errorResponse(res, 'workspaceId is required', 400);
    return null;
  }
  if (!(await isWorkspaceMember(workspaceId, req.userId))) {
    errorResponse(res, 'Workspace access denied', 403);
    return null;
  }
  return workspaceId;
};

const weekKey = (date) => {
  const d = new Date(date);
  const first = d.getDate() - d.getDay();
  const week = new Date(d.setDate(first));
  week.setHours(0, 0, 0, 0);
  return week.toISOString().slice(0, 10);
};

const overview = async (req, res, next) => {
  try {
    const workspaceId = await requireWorkspace(req, res);
    if (!workspaceId) return;

    const [totalMeetings, totalTasks, totalMembers, meetings] = await Promise.all([
      prisma.meeting.count({ where: { workspaceId } }),
      prisma.actionItem.count({ where: { meeting: { workspaceId } } }),
      prisma.workspaceMember.count({ where: { workspaceId } }),
      prisma.meeting.findMany({ where: { workspaceId }, select: { duration: true } })
    ]);

    const totalSeconds = meetings.reduce((sum, meeting) => sum + (meeting.duration || 0), 0);
    const hoursRecorded = Math.round((totalSeconds / 3600) * 10) / 10;

    return successResponse(res, {
      totalMeetings,
      totalTasks,
      totalMembers,
      hoursRecorded,
      totalHoursRecorded: hoursRecorded
    }, 'Analytics overview fetched');
  } catch (error) {
    return next(error);
  }
};

const meetingsOverTime = async (req, res, next) => {
  try {
    const workspaceId = await requireWorkspace(req, res);
    if (!workspaceId) return;

    const since = new Date();
    since.setDate(since.getDate() - 84);
    const meetings = await prisma.meeting.findMany({
      where: { workspaceId, createdAt: { gte: since } },
      select: { createdAt: true }
    });

    const buckets = {};
    meetings.forEach((meeting) => {
      const key = weekKey(meeting.createdAt);
      buckets[key] = (buckets[key] || 0) + 1;
    });

    return successResponse(res, Object.entries(buckets).map(([week, count]) => ({ week, count })), 'Meetings over time fetched');
  } catch (error) {
    return next(error);
  }
};

const taskCompletion = async (req, res, next) => {
  try {
    const workspaceId = await requireWorkspace(req, res);
    if (!workspaceId) return;

    const tasks = await prisma.actionItem.findMany({
      where: { meeting: { workspaceId } },
      select: { createdAt: true, status: true }
    });

    const buckets = {};
    tasks.forEach((task) => {
      const key = weekKey(task.createdAt);
      if (!buckets[key]) buckets[key] = { week: key, total: 0, done: 0, completionRate: 0 };
      buckets[key].total += 1;
      if (task.status === 'DONE') buckets[key].done += 1;
      buckets[key].completionRate = Math.round((buckets[key].done / buckets[key].total) * 100);
    });

    return successResponse(res, Object.values(buckets), 'Task completion fetched');
  } catch (error) {
    return next(error);
  }
};

const topSpeakers = async (req, res, next) => {
  try {
    const workspaceId = await requireWorkspace(req, res);
    if (!workspaceId) return;

    const segments = await prisma.transcriptSegment.findMany({
      where: { transcript: { meeting: { workspaceId } } },
      select: { speaker: true }
    });

    const counts = {};
    segments.forEach((segment) => {
      const speaker = segment.speaker || 'Unknown';
      counts[speaker] = (counts[speaker] || 0) + 1;
    });

    const data = Object.entries(counts)
      .map(([speaker, segments]) => ({ speaker, segments }))
      .sort((a, b) => b.segments - a.segments)
      .slice(0, 10);

    return successResponse(res, data, 'Top speakers fetched');
  } catch (error) {
    return next(error);
  }
};

const sentimentTrends = async (req, res, next) => {
  try {
    const workspaceId = await requireWorkspace(req, res);
    if (!workspaceId) return;

    const transcripts = await prisma.transcript.findMany({
      where: { meeting: { workspaceId } },
      select: { sentiment: true, meeting: { select: { createdAt: true } } }
    });

    const buckets = {};
    transcripts.forEach((transcript) => {
      const key = weekKey(transcript.meeting.createdAt);
      if (!buckets[key]) buckets[key] = { week: key, positive: 0, neutral: 0, negative: 0 };
      const sentiment = ['positive', 'negative', 'neutral'].includes(transcript.sentiment)
        ? transcript.sentiment
        : 'neutral';
      buckets[key][sentiment] += 1;
    });

    return successResponse(res, Object.values(buckets), 'Sentiment trends fetched');
  } catch (error) {
    return next(error);
  }
};

const durationDistribution = async (req, res, next) => {
  try {
    const workspaceId = await requireWorkspace(req, res);
    if (!workspaceId) return;

    const meetings = await prisma.meeting.findMany({
      where: { workspaceId },
      select: { duration: true }
    });

    const buckets = {
      '0-30min': 0,
      '30-60min': 0,
      '60-120min': 0,
      '120+min': 0
    };

    meetings.forEach((meeting) => {
      const minutes = (meeting.duration || 0) / 60;
      if (minutes < 30) buckets['0-30min'] += 1;
      else if (minutes < 60) buckets['30-60min'] += 1;
      else if (minutes < 120) buckets['60-120min'] += 1;
      else buckets['120+min'] += 1;
    });

    return successResponse(res, Object.entries(buckets).map(([bucket, count]) => ({ bucket, count })), 'Duration distribution fetched');
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  overview,
  meetingsOverTime,
  taskCompletion,
  topSpeakers,
  sentimentTrends,
  durationDistribution
};
