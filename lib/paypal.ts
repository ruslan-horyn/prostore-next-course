import { z } from 'zod';

const baseUrl =
  process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com';

const paypalApi = {
  generateAccessToken: `${baseUrl}/v1/oauth2/token`,
  createOrder: `${baseUrl}/v2/checkout/orders`,
  capturePayment: `${baseUrl}/v2/checkout/orders/{{id}}/capture`,
};

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

export const handlePaypalResponse = async (res: Response) => {
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }

  return res.json();
};

export const generateAccessToken = async () => {
  const auth = Buffer.from(
    `${paypalCredentials.paypalClientId}:${paypalCredentials.paypalClientSecret}`
  ).toString('base64');

  const res = await fetch(paypalApi.generateAccessToken, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  const data = await handlePaypalResponse(res);
  return data.access_token;
};

const createOrder = async (price: number) => {
  const accessToken = await generateAccessToken();

  const res = await fetch(paypalApi.createOrder, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: price,
          },
        },
      ],
    }),
  });

  return handlePaypalResponse(res);
};

const capturePayment = async (orderId: string) => {
  const accessToken = await generateAccessToken();

  const res = await fetch(paypalApi.capturePayment.replace('{{id}}', orderId), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
    }),
  });

  return handlePaypalResponse(res);
};

export const paypal = {
  generateAccessToken,
  createOrder,
  capturePayment,
};
