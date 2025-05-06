'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { signInWithCredentials } from '@/lib/actions/user.actions';
import { formFieldsDefaultValues } from '@/lib/constants';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

const { signIn: signInDefaultValues } = formFieldsDefaultValues;

const SignInButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} className='w-full' variant='default'>
      {pending ? 'Signing In...' : 'Sign In with credentials'}
    </Button>
  );
};

export const CredentialsSignInForm = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const [state, action] = useActionState(signInWithCredentials, {
    success: false,
    message: '',
  });

  return (
    <form action={action}>
      <Input
        name='callbackUrl'
        defaultValue={callbackUrl}
        autoComplete='off'
        hidden
      />
      <div className='space-y-6'>
        <div>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            name='email'
            required
            type='email'
            defaultValue={signInDefaultValues.email}
            autoComplete='email'
          />
        </div>
        <div>
          <Label htmlFor='password'>Password</Label>
          <Input
            id='password'
            name='password'
            required
            type='password'
            defaultValue={signInDefaultValues.password}
            autoComplete='current-password'
          />
        </div>
        <SignInButton />

        {state && !state.success && (
          <p className='text-destructive text-center text-sm'>
            {state.message}
          </p>
        )}

        <div className='text-muted-foreground text-center text-sm'>
          Don&apos;t have an account?{' '}
          <Link target='_self' className='link' href='/sign-up'>
            Sign Up
          </Link>
        </div>
      </div>
    </form>
  );
};
