import { envs } from '@/lib/constants';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className='border-t'>
      <div className='flex-center p-5'>
        {currentYear} {envs.APP_NAME}. All Rights reserved.
      </div>
    </footer>
  );
};
