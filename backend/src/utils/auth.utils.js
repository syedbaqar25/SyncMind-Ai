const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 12;

const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

const stripUserSecrets = (user) => {
  if (!user) return user;
  const {
    password,
    emailVerifyToken,
    passwordResetToken,
    passwordResetExpiry,
    refreshTokens,
    ...safeUser
  } = user;
  return safeUser;
};

module.exports = {
  SALT_ROUNDS,
  hashPassword,
  comparePassword,
  stripUserSecrets
};
