import { getAllUsers, deleteUser } from '@/lib/actions/user.actions';
import { requiredAdmin } from '@/lib/auth-guard';
import { getPaginationParams } from '@/lib/pagination';
import type { PaginationParams } from '@/types/shared';
import type { Metadata } from 'next';

import DeleteDialog from '@/components/shared/delete-dialog';
import { Pagination } from '@/components/shared/pagination';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { formatId } from '@/lib/utils';
import Link from 'next/link';
import { USER_ROLES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
export const metadata: Metadata = {
  title: 'Users',
};

const AdminUsersPage = async (props: {
  searchParams: Promise<PaginationParams>;
}) => {
  await requiredAdmin();
  const { page, limit } = await getPaginationParams(props.searchParams);

  const { users, totalPages } = await getAllUsers({
    page,
    limit,
  });

  return (
    <div>
      <h1>Users</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>NAME</TableHead>
            <TableHead>EMAIL</TableHead>
            <TableHead>ROLE</TableHead>
            <TableHead className='w-[100px]'>ACTIONS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{formatId(user.id)}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.role === USER_ROLES.USER && (
                  <Badge variant='secondary'>{user.role}</Badge>
                )}
                {user.role === USER_ROLES.ADMIN && <Badge>{user.role}</Badge>}
              </TableCell>
              <TableCell className='space-x-1'>
                <Button asChild variant='outline' size='sm'>
                  <Link href={`/admin/users/${user.id}`}>Edit</Link>
                </Button>
                <DeleteDialog id={user.id} action={deleteUser} />
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
  );
};

export default AdminUsersPage;
