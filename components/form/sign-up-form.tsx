'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { signUp } from '@/lib/actions/user.actions';
import { formFieldsDefaultValues } from '@/lib/constants';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

const { signUp: signUpDefaultValues } = formFieldsDefaultValues;

const SignUpButton = () => {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending} className='w-full' variant='default'>
      {pending ? 'Submitting...' : 'Sign Up'}
    </Button>
  );
};

export const SignUpForm = () => {
  const [data, action] = useActionState(signUp, {
    message: '',
    success: false,
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  return (
    <form action={action}>
      <input type='hidden' name='callbackUrl' value={callbackUrl} />
      <div className='space-y-6'>
        <div>
          <Label htmlFor='name'>Name</Label>
          <Input
            id='name'
            name='name'
            required
            type='text'
            defaultValue={signUpDefaultValues.name}
            autoComplete='name'
          />
        </div>
        <div>
          <Label htmlFor='email'>Email</Label>
          <Input
            id='email'
            name='email'
            required
            type='email'
            defaultValue={signUpDefaultValues.email}
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
            defaultValue={signUpDefaultValues.password}
            autoComplete='current-password'
          />
        </div>
        <div>
          <Label htmlFor='confirmPassword'>Confirm Password</Label>
          <Input
            id='confirmPassword'
            name='confirmPassword'
            required
            type='password'
            defaultValue={signUpDefaultValues.confirmPassword}
            autoComplete='current-password'
          />
        </div>
        <div>
          <SignUpButton />
        </div>

        {!data.success && (
          <div className='text-destructive text-center'>{data.message}</div>
        )}

        <div className='text-muted-foreground text-center text-sm'>
          Already have an account?{' '}
          <Link
            target='_self'
            className='link'
            href={`/sign-in?callbackUrl=${callbackUrl}`}
          >
            Sign In
          </Link>
        </div>
      </div>
    </form>
  );
};
