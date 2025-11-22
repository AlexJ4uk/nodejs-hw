import crypto from 'crypto';
import { Session } from '../models/session.js';
import { FIFTEEN_MINUTES, ONE_DAY } from '../constants/time.js';

export const createSession = async (userId) => {
  const accessToken = crypto.randomBytes(30).toString('base64');
  const refreshToken = crypto.randomBytes(30).toString('base64');

  const now = Date.now();
  const accessTokenValidUntil = new Date(now + FIFTEEN_MINUTES);
  const refreshTokenValidUntil = new Date(now + ONE_DAY);

  const session = await Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return session;
};

export const setSessionCookies = (res, session) => {
  const accessMaxAge = FIFTEEN_MINUTES;
  const refreshMaxAge = ONE_DAY;

  const cookieOptionsCommon = {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  };

  res.cookie('accessToken', session.accessToken, {
    ...cookieOptionsCommon,
    maxAge: accessMaxAge,
  });

  res.cookie('refreshToken', session.refreshToken, {
    ...cookieOptionsCommon,
    maxAge: refreshMaxAge,
  });

  res.cookie('sessionId', session._id.toString(), {
    ...cookieOptionsCommon,
    maxAge: refreshMaxAge,
  });
};
