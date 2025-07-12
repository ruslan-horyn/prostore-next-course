import DeleteDialog from '@/components/shared/delete-dialog';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { deleteProduct, getAllProducts } from '@/lib/actions/product.actions';
import { requiredAdmin } from '@/lib/auth-guard';
import { formatCurrency, formatId } from '@/lib/utils';
import { PlusIcon } from 'lucide-react';
import Link from 'next/link';

const AdminProductsPage = async (props: {
  searchParams: Promise<{
    page: string;
    query: string;
    category: string;
  }>;
}) => {
  await requiredAdmin();
  const searchParams = await props.searchParams;

  const page = Number(searchParams.page) || 1;
  const searchText = searchParams.query || '';
  const category = searchParams.category || '';

  const { data: products, totalPages } = await getAllProducts({
    query: searchText,
    page,
    category,
  });

  if (!products || products.length === 0) {
    return (
      <Card className=''>
        <CardContent className='flex-center text-center'>
          <CardTitle>No products found</CardTitle>
        </CardContent>
        <CardFooter className='flex-center'>
          <Button variant='outline' asChild>
            <Link href='/admin/products/create' className='flex-center gap-2'>
              <PlusIcon className='h-4 w-4' />
              Create Product
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className='space-y-2'>
      <div className='flex-between'>
        <h1 className='h2-bold'>Products</h1>
        <Button asChild variant='default'>
          <Link href='/admin/products/create'>Create Product</Link>
        </Button>
      </div>
      <div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>NAME</TableHead>
              <TableHead>PRICE</TableHead>
              <TableHead>CATEGORY</TableHead>
              <TableHead>STOCK</TableHead>
              <TableHead>RATING</TableHead>
              <TableHead className='w-[100px]'>ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{formatId(product.id)}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{formatCurrency(product.price)}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.rating}</TableCell>
                <TableCell className='space-x-1'>
                  <Button asChild variant='outline' size='sm'>
                    <Link href={`/admin/products/${product.id}`}>Edit</Link>
                  </Button>
                  <DeleteDialog id={product.id} action={deleteProduct} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          {totalPages && totalPages > 1 && (
            <TableFooter>
              <TableRow>
                <TableCell colSpan={100}>
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    className='w-full justify-end'
                  />
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>
    </div>
  );
};

export default AdminProductsPage;
