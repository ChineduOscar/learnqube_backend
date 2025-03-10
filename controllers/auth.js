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
      email:user.email,
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
      email:user.email,
      role: user.role,
    }
  });
}

const googleCallback = (req, res, next) => {
  passport.authenticate('google', (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect(`${process.env.FRONTEND_URL}/login`);
    console.log(user)
    const token = user.createJWT();
    
    const encodedToken = encodeURIComponent(token);
    const encodedName = encodeURIComponent(user.name);
    const encodedEmail = encodeURIComponent(user.email);
    const encodedRole = encodeURIComponent(user.role);
    
    const redirectUrl = `${process.env.FRONTEND_URL}/dashboard?token=${encodedToken}&name=${encodedName}&email=${encodedEmail}&role=${encodedRole}`;
    res.redirect(redirectUrl);
  })(req, res, next);
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
}