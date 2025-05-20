import { generateAccessToken, paypal } from '@/lib/paypal';

jest.mock('@/lib/paypal', () => ({
  generateAccessToken: jest.fn().mockResolvedValue('mockedAccessToken'),
  paypal: {
    createOrder: jest
      .fn()
      .mockResolvedValue({ id: 'mockOrderId', status: 'CREATED' }),
    capturePayment: jest.fn().mockResolvedValue({ status: 'COMPLETED' }),
  },
}));

describe('PayPal API', () => {
  test('generates a PayPal access token', async () => {
    const tokenResponse = await generateAccessToken();

    expect(typeof tokenResponse).toBe('string');
    expect(tokenResponse.length).toBeGreaterThan(0);
  });

  test('creates a PayPal order', async () => {
    const price = 10.0;

    const orderResponse = await paypal.createOrder(price);

    expect(orderResponse).toHaveProperty('id');
    expect(orderResponse).toHaveProperty('status', 'CREATED');
  });

  test('simulates capturing a PayPal order', async () => {
    const orderId = '100';

    const captureResponse = await paypal.capturePayment(orderId);

    expect(captureResponse).toHaveProperty('status', 'COMPLETED');
  });
});
