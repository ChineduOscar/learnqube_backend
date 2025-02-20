import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import passport from "passport";
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';

const register = async (req, res) => {
  const user = await User.create({ ...req.body })
  const token = user.createJWT()
  
  // Set token in HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none', // Important for cross-origin
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  });

  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
      role: user.role,
    }
  });
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    throw new BadRequestError('Please provide email and password')
  }
  const user = await User.findOne({ email })
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  const isPasswordCorrect = await user.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  
  const token = user.createJWT()
  
  // Set token in HTTP-only cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
      role: user.role,
    }
  });
}

const googleCallback = (req, res, next) => {
  passport.authenticate('google', (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);

    const token = jwt.sign(
      { userId: user._id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_LIFETIME || '1d' }
    );
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000
    });

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  })(req, res, next);
};

const authenticated = async (req, res) => {
  // Get user from request (set by auth middleware)
  const user = req.user;
  
  if (!user) {
    throw new UnauthenticatedError('Authentication invalid');
  }

  // Refresh token
  const token = user.createJWT();
  
  // Update cookie with new token
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 24 * 60 * 60 * 1000
  });

  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
      role: user.role,
    }
  });
};

const logout = (req, res) => {
  // Clear the cookie
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'none',
    maxAge: 0
  });
  
  req.logout();
  res.status(StatusCodes.OK).json({ message: 'User logged out successfully' });
};

export {
  register,
  login,
  googleCallback,
  authenticated,
  logout,
}