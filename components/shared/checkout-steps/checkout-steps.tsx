import { cn } from '@/lib/utils';
import { Fragment } from 'react';

const checkoutSteps = [
  'User Login',
  'Shipping Address',
  'Payment Method',
  'Place Order',
] as const;

export const CheckoutSteps = ({ current = 0 }: { current: number }) => {
  return (
    <div className='flex-between mb-10 flex-col md:flex-row'>
      {checkoutSteps.map((step, index) => (
        <Fragment key={step}>
          <div
            className={cn(
              'w-56 rounded-full p-2 text-center text-sm',
              index === current ? 'bg-secondary' : ''
            )}
          >
            {step}
          </div>
          {step !== checkoutSteps[checkoutSteps.length - 1] && (
            <hr className='w-16 border-t border-gray-300' />
          )}
        </Fragment>
      ))}
    </div>
  );
};
