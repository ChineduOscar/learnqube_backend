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
    const token = user.createJWT()

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
    });
    

    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  })(req, res, next);
};

const getUserToken = (req, res) => {
    const token = req.cookies.token;
    res.json({ token });
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
  getUserToken
}