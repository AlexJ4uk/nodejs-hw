import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';
import { fileURLToPath } from 'url';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import { sendEmail } from '../utils/sendMail.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const registerUser = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const exists = await User.findOne({ email });
    if (exists) throw createHttpError(400, 'Email already in use');

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashed,
      username,
    });

    const session = await createSession(user._id);

    setSessionCookies(res, session);

    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) throw createHttpError(401, 'Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw createHttpError(401, 'Invalid credentials');

    await Session.deleteMany({ userId: user._id });

    const session = await createSession(user._id);

    setSessionCookies(res, session);

    res.status(200).json(user.toJSON());
  } catch (err) {
    next(err);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;

    if (sessionId) {
      await Session.findByIdAndDelete(sessionId);
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;

    const session = await Session.findById(sessionId);
    if (!session) throw createHttpError(401, 'Session not found');

    if (session.refreshToken !== refreshToken)
      throw createHttpError(401, 'Invalid refresh token');

    if (new Date() > session.refreshTokenValidUntil)
      throw createHttpError(401, 'Refresh token expired');

    await Session.findByIdAndDelete(sessionId);

    const newSession = await createSession(session.userId);

    setSessionCookies(res, newSession);

    res.json({ message: 'Session refreshed successfully' });
  } catch (err) {
    next(err);
  }
};

export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: 'Password reset email sent successfully',
      });
    }

    const token = jwt.sign(
      { sub: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' },
    );

    const resetLink = `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`;

    const templatePath = path.join(
      __dirname,
      '..',
      'templates',
      'reset-password-email.html',
    );
    const emailTemplate = handlebars.compile(
      await fs.readFile(templatePath, 'utf-8'),
    );

    const html = emailTemplate({
      username: user.username,
      resetLink,
    });

    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html,
    });

    res.json({ message: 'Password reset email sent successfully' });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    let payload;

    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw createHttpError(401, 'Invalid or expired token');
    }

    const user = await User.findOne({
      _id: payload.sub,
      email: payload.email,
    });

    if (!user) throw createHttpError(404, 'User not found');

    const hashed = await bcrypt.hash(password, 10);

    await User.updateOne({ _id: user._id }, { password: hashed });

    await Session.deleteMany({ userId: user._id });

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};
