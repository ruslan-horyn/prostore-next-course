'use client';

import { Cart, CartItem } from '@/types/cart';
import { useTransition } from 'react';
import { toast } from 'sonner';

import { useRouter } from 'next/navigation';

import {
  addItemToCart as addItemToCartAction,
  removeItemFromCart as removeItemFromCartAction,
} from '@/lib/actions/card';
import { ArrowRight, Loader, Minus, Plus } from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from '../ui/table';
import { Button } from '../ui/button';

export const CartTable = ({ cart }: { cart: Cart | undefined }) => {
  const [isPending, startTransition] = useTransition();

  const removeItemFromCart = async (productId: string) => {
    startTransition(async () => {
      const res = await removeItemFromCartAction(productId);
      if (!res.success) {
        toast.error(res.message);
      }
    });
  };

  const addItemToCart = async (item: CartItem) => {
    startTransition(async () => {
      const res = await addItemToCartAction(item);
      if (!res.success) {
        toast.error(res.message);
      }
    });
  };

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <h1 className='h2-bold py-4'>Shopping Cart</h1>
        <p className='text-base'>
          Cart is empty.{' '}
          <Link href='/' className='underline'>
            Go shopping
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className='h2-bold py-4'>Shopping Cart</h1>
      <div className='grid md:grid-cols-4 md:gap-5'>
        <div className='overflow-x-auto md:col-span-3'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className='text-center'>Quantity</TableHead>
                <TableHead className='text-right'>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cart.items.map((item) => (
                <TableRow key={item.slug}>
                  <TableCell>
                    <Link
                      href={`/product/${item.slug}`}
                      className='flex items-center'
                    >
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={45}
                        height={45}
                      ></Image>
                      <span className='px-2'>{item.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div className='flex-center gap-2'>
                      <Button
                        disabled={isPending}
                        variant='outline'
                        type='button'
                        size='sm'
                        onClick={() => removeItemFromCart(item.productId)}
                      >
                        {isPending ? (
                          <Loader className='h-4 w-4 animate-spin' />
                        ) : (
                          <Minus className='h-4 w-4' />
                        )}
                      </Button>
                      <span>{item.qty}</span>
                      <Button
                        disabled={isPending}
                        variant='outline'
                        type='button'
                        size='sm'
                        onClick={() => addItemToCart(item)}
                      >
                        {isPending ? (
                          <Loader className='h-4 w-4 animate-spin' />
                        ) : (
                          <Plus className='h-4 w-4' />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className='text-right'>${item.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};
