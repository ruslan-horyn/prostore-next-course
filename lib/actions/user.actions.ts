'use server';

import { auth, signIn, signOut as signOutAuth } from 'auth';

import type { UserFormSchemaType } from '@/components/shared/admin/user-form';
import { prisma } from '@/lib/prisma';
import type { PaymentMethod } from '@/types/payment-method';
import type { PaginationParams } from '@/types/shared';
import type { ShippingAddress } from '@/types/shipping-address';
import { hashSync } from 'bcrypt-ts-edge';
import { revalidatePath } from 'next/cache';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { DEFAULT_PAGINATION_LIMIT, USER_ROLES } from '../constants';
import { formatError } from '../error-handlers';
import { calculateTotalPages } from '../utils';
import {
  paymentMethodSchema,
  shippingAddressSchema,
  signInFormSchema,
  signUpFormSchema,
} from '../validators';

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
export async function updateUser(data: UserFormSchemaType) {
  try {
    await prisma.user.update({
      where: { id: data.id },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
      },
    });

    revalidatePath('/admin/users');

    return { success: true, message: 'User updated successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

export async function getAllUsers({
  page = 1,
  limit = DEFAULT_PAGINATION_LIMIT,
}: PaginationParams) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count(),
  ]);

  const totalPages = calculateTotalPages({
    count: total,
    limit,
  });

  return {
    users,
    totalPages,
  };
}

export async function deleteUser(id: string) {
  try {
    const session = await auth();

    if (session?.user?.role !== USER_ROLES.ADMIN) {
      throw new Error('User is not authorized');
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath('/admin/users');

    return { success: true, message: 'User deleted successfully' };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
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

export async function updateProfile(user: { name: string; email: string }) {
  debugger;
  try {
    const session = await auth();
    if (!session?.user) throw new Error('User is not authenticated');

    const currentUser = await prisma.user.findFirst({
      where: {
        id: session.user.id,
      },
    });

    if (!currentUser) throw new Error('User not found');

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        name: user.name,
      },
    });

    return {
      success: true,
      message: 'User updated successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
