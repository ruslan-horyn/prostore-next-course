import { Button } from '@/components/ui/button';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Unauthorized Access',
};

const UnauthorizedPage = async () => {
  return (
    <div className='container mx-auto flex h-[calc(100vh-100px)] flex-col items-center justify-center space-y-4'>
      <h1 className='text-2xl font-bold'>Unauthorized Access</h1>
      <p className='text-muted-foreground'>
        You are not authorized to access this page.
      </p>
      <Button asChild>
        <Link href='/'>Go to home</Link>
      </Button>
    </div>
  );
};

export default UnauthorizedPage;
