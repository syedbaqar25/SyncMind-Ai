const { prisma } = require('../config/database');
const { verifyAccessToken } = require('../utils/jwt.utils');
const { errorResponse } = require('../utils/response.utils');
const { stripUserSecrets } = require('../utils/auth.utils');

const authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return errorResponse(res, 'Authentication required', 401);
  }

  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user) {
      return errorResponse(res, 'User not found', 401);
    }

    req.user = stripUserSecrets(user);
    req.userId = user.id;
    return next();
  } catch (error) {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

module.exports = {
  authenticate
};
