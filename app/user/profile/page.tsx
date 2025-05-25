import { auth } from '@/auth';
import { UserProfileForm } from '@/components/form/user-profile-form';
import { SessionProvider } from 'next-auth/react';

const ProfilePage = async () => {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <div className='mx-auto max-w-md space-y-4'>
        <h2 className='h2-bold'>Profile</h2>
        <UserProfileForm />
      </div>
    </SessionProvider>
  );
};

export default ProfilePage;
