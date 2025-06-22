import { requiredAdmin } from '@/lib/auth-guard';

const AdminUsersPage = async () => {
  await requiredAdmin();

  return <div>AdminUsersPage</div>;
};

export default AdminUsersPage;
