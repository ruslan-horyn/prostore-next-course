import Image from 'next/image';
import Link from 'next/link';

import { envs } from '@/lib/constants';
import { Menu } from './menu';

export const Header = () => {
  return (
    <header className='w-full border-b'>
      <div className='wrapper flex-between'>
        <div className='flex-start'>
          <Link href='/' className='flex-start'>
            <Image
              priority={true}
              src='/images/logo.svg'
              width={48}
              height={48}
              alt={`${envs.APP_NAME}-logo`}
            />
            <span className='ml-3 hidden text-2xl font-bold lg:block'>
              {envs.APP_NAME}
            </span>
          </Link>
        </div>
        <Menu />
      </div>
    </header>
  );
};
