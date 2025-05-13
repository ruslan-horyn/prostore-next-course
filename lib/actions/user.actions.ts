'use server';

import { auth, signIn, signOut as signOutAuth } from 'auth';

import { prisma } from '@/lib/prisma';
import { ShippingAddress } from '@/types/shipping-address';
import { hashSync } from 'bcrypt-ts-edge';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { formatError } from '../error-handlers';
import {
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
  paymentMethodSchema,
} from '../validators';
import type { PaymentMethod } from '@/types/payment-method';

export async function signInWithCredentials(
  _prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', user);

    return { success: true, message: 'Signed in successfully' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return { success: false, message: 'Invalid email or password' };
  }
}

export async function signOut() {
  await signOutAuth();
}

export async function signUp(_prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get('name'),
      email: formData.get('email'),
      confirmPassword: formData.get('confirmPassword'),
      password: formData.get('password'),
    });

    const hashedPassword = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: hashedPassword,
      },
    });

    await signIn('credentials', {
      email: user.email,
      password: user.password,
    });

    return { success: true, message: 'User created successfully' };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      success: false,
      message: formatError(error),
    };
  }
}

export async function getUserById(id: string) {
  const user = await prisma.user.findFirst({
    where: { id },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

export const updateUserAddress = async (data: ShippingAddress) => {
  try {
    const address = shippingAddressSchema.parse(data);
    const session = await auth();
    const userId = session?.user?.id;

    const currentUser = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!currentUser) throw new Error('User not found');
    // TODO: If user is not logged in, add address to the cart

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });

    return {
      success: true,
      message: 'Address added successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};

export const updateUserPaymentMethod = async (data: PaymentMethod) => {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const currentUser = await prisma.user.findFirst({
      where: { id: userId },
    });
    if (!currentUser) throw new Error('User not found');

    const paymentMethod = paymentMethodSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });

    return {
      success: true,
      message: 'User updated successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
};
