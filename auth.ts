import NextAuth, { NextAuthConfig } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import type { PrismaClient } from '@prisma/client';
import { compareSync } from 'bcrypt-ts-edge';
import { z } from 'zod';
import { authConfig } from './auth.config';
import { cookies } from 'next/headers';

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
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;

        // If user has no name then use the email
        if (user.name === 'NO_NAME') {
          const name = user.email!.split('@')[0];
          token.name = name;
          await prisma.user.update({
            where: { id: user.id },
            data: { name },
          });
        } else {
          token.name = user.name;
        }

        if (trigger === 'signIn' || trigger === 'signUp') {
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get('sessionCartId')?.value;

          if (sessionCartId) {
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId },
            });

            if (sessionCart) {
              // Delete current user cart
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });

              // Assign new cart
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
        }
      }

      if (trigger === 'update') token.name = session.user.name;

      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.name = token.name;
      session.user.email = token.email as string;

      return session;
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
