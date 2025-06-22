import { requiredAdmin } from '@/lib/auth-guard';

const AdminOrdersPage = async () => {
  await requiredAdmin();

  return <div>AdminOrdersPage</div>;
};

export default AdminOrdersPage;
