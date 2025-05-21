import Link from 'next/link';
import { auth } from 'auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/lib/actions/user.actions';
import { UserIcon } from 'lucide-react';

export const UserButton = async () => {
  const session = await auth();

  if (!session || !session.user) {
    return (
      <Button asChild>
        <Link href='/sign-in'>
          <UserIcon />
          Sign In
        </Link>
      </Button>
    );
  }
  const userName = session.user.name ?? 'User';
  const firstInitial = userName.trim().charAt(0).toUpperCase();

  return (
    <div className='flex items-center gap-2'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className='flex items-center'>
            <Button
              variant='default'
              className='relative ml-2 flex h-8 w-8 items-center justify-center rounded-full'
            >
              {firstInitial}
            </Button>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='w-56' align='end' forceMount>
          <DropdownMenuLabel className='font-normal'>
            <div className='flex flex-col space-y-1'>
              <p className='text-sm leading-none font-medium'>
                {session.user?.name}
              </p>
              <p className='text-muted-foreground text-xs leading-none'>
                {session.user?.email}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuItem>
            <Link className='w-full' href='/user/profile'>
              User Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link className='w-full' href='/user/orders'>
              Order History
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem className='mb-1 p-0'>
            <form action={signOut} className='w-full'>
              <Button
                className='h-4 w-full justify-start px-2 py-4'
                variant='ghost'
              >
                Sign Out
              </Button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
