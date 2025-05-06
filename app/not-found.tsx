'use client';
import { Button } from '@/components/ui/button';
import { envs } from '@/lib/constants';
import Image from 'next/image';

const { APP_NAME } = envs;

const NotFound = () => {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center'>
      <Image
        priority={true}
        src='/images/logo.svg'
        width={48}
        height={48}
        alt={`${APP_NAME} logo`}
      />
      <div className='w-1/3 rounded-lg p-6 text-center shadow-md'>
        <h1 className='mb-4 text-3xl font-bold'>Not Found</h1>
        <p className='text-destructive'>Could not find requested resource</p>
        <Button
          variant='outline'
          className='mt-4 ml-2'
          onClick={() => (window.location.href = '/')}
        >
          Back to home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
