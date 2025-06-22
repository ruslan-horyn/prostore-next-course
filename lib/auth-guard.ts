import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { USER_ROLES } from './constants';

export const requiredAdmin = async () => {
  const session = await auth();

  if (session?.user?.role !== USER_ROLES.ADMIN) {
    return redirect('/unauthorized');
  }

  return session;
};
