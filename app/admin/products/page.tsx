import { requiredAdmin } from '@/lib/auth-guard';

const AdminProductsPage = async () => {
  await requiredAdmin();

  return <div>AdminProductsPage</div>;
};

export default AdminProductsPage;
