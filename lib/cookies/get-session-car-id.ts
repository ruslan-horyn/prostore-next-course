'use server';

import { cookies as cookiesHeaders } from 'next/headers';

import { cookieNames } from '../constants';

export const getSessionCartId = async () => {
  const cookies = await cookiesHeaders();
  const sessionCartIdCookie = cookies.get(cookieNames.sessionCartId);
  let sessionCartId = sessionCartIdCookie?.value;

  if (!sessionCartId) {
    sessionCartId = crypto.randomUUID();
    cookies.set(cookieNames.sessionCartId, sessionCartId);
  }

  return sessionCartId;
};
