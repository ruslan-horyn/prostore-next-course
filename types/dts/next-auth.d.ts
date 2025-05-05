/* eslint-disable @typescript-eslint/no-unused-vars */
import type { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string | null;
  }
}
