import { z } from 'zod';

const baseUrl =
  process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';

const tokenApi = `${baseUrl}/v1/oauth2/token`;

const paypalClientId = process.env.PAYPAL_CLIENT_ID;
const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;

const paypalCredentialsSchema = z.object({
  paypalClientId: z.string().min(1, 'Client ID is required'),
  paypalClientSecret: z.string().min(1, 'Client Secret is required'),
});

const paypalCredentials = paypalCredentialsSchema.parse({
  paypalClientId,
  paypalClientSecret,
});

export const paypal = {};

export const generateAccessToken = async () => {
  const auth = Buffer.from(
    `${paypalCredentials.paypalClientId}:${paypalCredentials.paypalClientSecret}`
  ).toString('base64');

  const res = await fetch(tokenApi, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  const data = await res.json();

  return data.access_token;
};
