import NextAuth, { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import type { PrismaClient } from '@prisma/client';
import { compareSync } from 'bcrypt-ts-edge';
import { z } from 'zod';
import { authConfig } from './auth.config';
import { cookies } from 'next/headers';
import { cookieNames } from './lib/constants';

export const config = {
  pages: {
    signIn: '/sign-in',
    error: '/sign-in',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
  adapter: PrismaAdapter(prisma as PrismaClient),
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: 'email' },
        password: { type: 'password' },
      },
      async authorize(credentials) {
        const result = z
          .object({
            email: z.string().email(),
            password: z.string(),
          })
          .safeParse(credentials);

        if (!result.success) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: {
            email: result.data.email,
          },
        });

        if (!user || !user.password) {
          return null;
        }

        const isMatchPassword = compareSync(
          result.data.password,
          user.password
        );

        if (!isMatchPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, session, trigger }) {
      if (!user || !user.email) {
        return token;
      }
      const { id, email, name = 'NO_NAME', role } = user;

      token.id = id;
      token.role = role;
      if (name === 'NO_NAME') {
        const [name] = email.split('@');
        token.name = name;

        await prisma.user.update({
          where: { id },
          data: { name },
        });
      }

      if (trigger === 'signIn' || trigger === 'signUp') {
        const cookieStore = await cookies();
        const sessionCartId = cookieStore.get(cookieNames.sessionCartId)?.value;

        if (sessionCartId) {
          const cart = await prisma.cart.findFirst({
            where: { sessionCartId },
          });

          if (cart) {
            await prisma.cart.deleteMany({
              where: {
                userId: id,
              },
            });

            await prisma.cart.update({
              where: { id: cart.id },
              data: {
                userId: id,
              },
            });
          }
        }
      }

      if (session?.user.name && trigger === 'update') {
        token.name = session.user.name;
      }

      return token;
    },
    async session({ session, user, trigger, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }

      if (token.role) {
        session.user.role = token.role;
      }

      if (token.name) {
        session.user.name = token.name;
      }

      if (trigger === 'update') {
        session.user.name = user.name;
      }

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
