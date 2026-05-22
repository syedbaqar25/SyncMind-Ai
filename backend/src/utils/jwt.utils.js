const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const accessExpiresIn = () => process.env.JWT_ACCESS_EXPIRES || '15m';
const refreshExpiresIn = () => process.env.JWT_REFRESH_EXPIRES || '7d';

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: accessExpiresIn()
  });
};

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId, tokenId: crypto.randomUUID() }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: refreshExpiresIn()
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  hashToken
};
