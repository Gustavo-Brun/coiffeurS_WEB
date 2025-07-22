'use server';

import { cookies } from 'next/headers';

import { sealData, unsealData } from 'iron-session';

export async function setCookies(userData: any) {
  const encryptedSession = await sealData(userData, {
    password: process.env.SESSION_PASSWORD as string
  });

  (await cookies()).set('auth_session', encryptedSession, {
    sameSite: 'strict',
    httpOnly: true
    // secure: true, # Uncomment this line when using HTTPS
  });
}

export async function removeCookies() {
  (await cookies()).delete('auth_session');
}

export async function getCookies() {
  const encryptedSession = (await cookies()).get('auth_session')?.value;

  const session = encryptedSession
    ? await unsealData(encryptedSession, {
        password: process.env.SESSION_PASSWORD as string
      })
    : null;

  return session ? (session as { data: string }) : null;
}
