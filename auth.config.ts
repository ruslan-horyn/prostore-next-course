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
      const { pathname, origin } = request.nextUrl;

      const isProtectedPath = protectedPaths.some((p) => p.test(pathname));

      if (!auth && isProtectedPath) {
        const redirectUrl = new URL('/sign-in', origin);

        redirectUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(redirectUrl);
      }

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
