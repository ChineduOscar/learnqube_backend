import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import passport from "passport";
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';

const register = async (req, res) => {
  const user = await User.create({ ...req.body })
  const token = user.createJWT()

  res.status(StatusCodes.OK).json({ token,
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

  res.status(StatusCodes.OK).json({ token,
    user: {
      name: user.name,
      role: user.role,
    }
  });
}

const googleCallback = (req, res, next) => {
  passport.authenticate('google', (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect(`${process.env.FRONTEND_URL}/login`);

    

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  })(req, res, next);
};

const getCurrentUser = async (req, res) => {
  console.log('user', req.user)
  const user = req.user;


  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
      role: user.role,
      email: user.email,
    }
  });
};


const logout = (req, res) => {
  req.logout();
  res.status(StatusCodes.OK).json({ message: 'User logged out successfully' });
};

export {
  register,
  login,
  googleCallback,
  logout,
  getCurrentUser
}