const { hashPassword, comparePassword } = require('../../utils/auth.utils');
const { generateAccessToken, generateRefreshToken, verifyAccessToken } = require('../../utils/jwt.utils');

describe('auth utilities', () => {
  test('hashPassword returns bcrypt hash (not plaintext)', async () => {
    const hash = await hashPassword('password123');
    expect(hash).not.toBe('password123');
    expect(hash).toMatch(/^\$2/);
  });

  test('hashPassword same input -> different hashes', async () => {
    const first = await hashPassword('password123');
    const second = await hashPassword('password123');
    expect(first).not.toBe(second);
  });

  test('comparePassword true for correct password', async () => {
    const hash = await hashPassword('password123');
    await expect(comparePassword('password123', hash)).resolves.toBe(true);
  });

  test('comparePassword false for wrong password', async () => {
    const hash = await hashPassword('password123');
    await expect(comparePassword('wrong', hash)).resolves.toBe(false);
  });

  test('generateAccessToken returns string with 3 dot-separated parts', () => {
    expect(generateAccessToken('user_1').split('.')).toHaveLength(3);
  });

  test('generateRefreshToken returns string with 3 dot-separated parts', () => {
    expect(generateRefreshToken('user_1').split('.')).toHaveLength(3);
  });

  test('verifyAccessToken decodes correct userId from token', () => {
    expect(verifyAccessToken(generateAccessToken('user_1')).userId).toBe('user_1');
  });

  test('verifyAccessToken throws on expired token', () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ userId: 'user_1' }, process.env.JWT_ACCESS_SECRET, { expiresIn: '-1s' });
    expect(() => verifyAccessToken(token)).toThrow();
  });

  test('verifyAccessToken throws on tampered token', () => {
    const token = generateAccessToken('user_1');
    expect(() => verifyAccessToken(`${token.slice(0, -2)}xx`)).toThrow();
  });
});
