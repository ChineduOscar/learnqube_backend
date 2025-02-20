import { verify } from 'jsonwebtoken';
import { UnauthenticatedError } from '../errors';

const auth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new UnauthenticatedError('Authentication invalid');
  }
  const token = authHeader.split(' ')[1];

  try {
    const payload = verify(token, process.env.JWT_SECRET);
    req.user = { userId: payload.userId, name: payload.name, role: payload.role };

    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication invalid');
  }
};

export default auth;
