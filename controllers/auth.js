import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import passport from "passport";
import { BadRequestError, UnauthenticatedError } from '../errors/index.js';

const register = async (req, res) => {
  const user = await User.create({ ...req.body })
  const token = user.createJWT()
  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
      role: user.role,
    },
    token,
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
  // compare password
  const token = user.createJWT()
  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
      role: user.role,
    },
    token,
  });
}

const googleCallback = (req, res, next) => {
  passport.authenticate('google', (err, user) => {
    if (err) return next(err);
    if (!user) return res.redirect(`${process.env.FRONTEND_URL}/login`);

    const token = user.createJWT();

    // Store JWT in a secure, HTTP-only cookie
    res.cookie("userToken", token, {
      httpOnly: true, // Secure, can't be accessed via JavaScript
      secure: true,
      sameSite: "None",
      domain: ".onrender.com", 
    });

    // Store user info (name & role) in a normal cookie (accessible in frontend)
    res.cookie("userInfo", JSON.stringify({ name: user.name, role: user.role }), {
      httpOnly: false, // Can be accessed by frontend
      secure: true,
      sameSite: "None",
      domain: ".onrender.com",
    });

    // Redirect user to frontend dashboard
    res.redirect(`${process.env.FRONTEND_URL}/dashboard?token=${token}?name=${user.name}?role=${user.role}`);
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