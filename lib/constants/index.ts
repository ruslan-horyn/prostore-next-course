const PAYMENT_METHODS = process.env.PAYMENT_METHODS
  ? process.env.PAYMENT_METHODS.split(', ')
  : ['PayPal', 'Stripe', 'CashOnDelivery'];

export const envs = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Prostore',
  APP_DESCRIPTION:
    process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
    'A modern store built with Next.js, ShadCN, and Prisma.',
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:3000',
  API_URL: process.env.API_URL || 'http://localhost:3000/api',
  LATEST_PRODUCTS_LIMIT: Number(process.env.LATEST_PRODUCTS_LIMIT || 4),
  SCHEMA_NAME: process.env.SCHEMA_NAME || 'prostore-next-course',
  PAYMENT_METHODS,
  DEFAULT_PAYMENT_METHOD: process.env.DEFAULT_PAYMENT_METHOD || 'PayPal',
};

export const PRICE_FOR_FREE_SHIPPING = 100;
export const TAX_RATE = 0.15;
export const SHIPPING_PRICE = 10;

export const PAGE_SIZE = Number(process.env.PAGE_SIZE) || 2;

export const formFieldsDefaultValues = {
  signIn: {
    email: '',
    password: '',
  },
  signUp: {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  },
  shippingAddress: {
    fullName: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    country: '',
  },
};

export const cookieNames = {
  sessionCartId: 'sessionCartId',
};
