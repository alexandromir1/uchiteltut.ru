import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'teacher-portal-secret-key-2024';

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

export const getUserIdFromContext = (context) => {
  const authHeader = context.request?.headers?.authorization;
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '');
  const decoded = verifyToken(token);
  return decoded?.userId || null;
};

