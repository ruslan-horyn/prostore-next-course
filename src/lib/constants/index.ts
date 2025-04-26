export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Prostore";
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  "A modern store built with Next.js, ShadCN, and Prisma.";
export const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";
export const API_URL = process.env.API_URL || "http://localhost:3000/api";
export const LATEST_PRODUCTS_LIMIT = Number(
  process.env.LATEST_PRODUCTS_LIMIT || 4
);
export const SCHEMA_NAME = process.env.SCHEMA_NAME || "prostore-next-course";

export const signInDefaultValues = {
  email: "",
  password: "",
};
