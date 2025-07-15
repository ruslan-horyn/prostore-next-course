import { UserForm } from '@/components/shared/admin/user-form';
import type { UserFormSchemaType } from '@/components/shared/admin/user-form';
import { getUserById } from '@/lib/actions/user.actions';
import { requiredAdmin } from '@/lib/auth-guard';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Update Product',
};

const AdminUserPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  await requiredAdmin();
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) return redirect('/admin/users');

  return (
    <div className='mx-auto max-w-5xl space-y-8'>
      <h1 className='h2-bold'>Update User</h1>
      <UserForm user={user as UserFormSchemaType} />
    </div>
  );
};

export default AdminUserPage;
