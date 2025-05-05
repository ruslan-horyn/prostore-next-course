import type { NextAuthConfig } from 'next-auth';
import { NextResponse } from 'next/server';

const protectedPaths = [
  /\/shipping-address/,
  /\/payment-method/,
  /\/place-order/,
  /\/profile/,
  /\/user\/(.*)/,
  /\/order\/(.*)/,
  /\/admin/,
];

export const authConfig = {
  providers: [],
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl;

      if (!auth && protectedPaths.some((p) => p.test(pathname))) return false;

      if (!request.cookies.get('sessionCartId')) {
        const sessionCartId = crypto.randomUUID();

        const response = NextResponse.next({
          request: {
            headers: new Headers(request.headers),
          },
        });

        response.cookies.set('sessionCartId', sessionCartId);

        return response;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
