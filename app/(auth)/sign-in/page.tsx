import { CredentialsSignInForm } from '@/components/form/credentials-signin-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { envs } from '@/lib/constants';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from 'auth';

const { APP_NAME } = envs;

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
};

const SignIn = async (props: {
  searchParams: Promise<{
    callbackUrl?: string;
  }>;
}) => {
  const { callbackUrl = '/' } = await props.searchParams;
  const session = await auth();

  if (session) {
    return redirect(callbackUrl);
  }

  return (
    <div className='mx-auto w-full max-w-md'>
      <Card>
        <CardHeader className='space-y-4'>
          <Link href='/' className='flex-center'>
            <Image
              priority={true}
              src='/images/logo.svg'
              width={100}
              height={100}
              alt={`${APP_NAME} logo`}
            />
          </Link>
          <CardTitle className='text-center'>Sign In</CardTitle>
          <CardDescription className='text-center'>
            Select a method to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <CredentialsSignInForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignIn;
