'use client';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { createProduct, updateProduct } from '@/lib/actions/product.actions';
import { SubmitHandler } from 'react-hook-form';

import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { generateSlug } from '@/lib/generate-slug';
import { UploadButton } from '@/lib/uploadthing';
import { Product } from '@/types/product';
import { Loader } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import {
  ProductFormSchemaType,
  ProductFormType,
  useProductForm,
} from './useProductForm';

export const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: ProductFormType;
  product?: Product;
  productId?: string;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useProductForm(type, product);
  const banner = form.watch('banner');

  const generateProductSlug = () => {
    const name = form.getValues('name');
    form.setValue('slug', generateSlug(name || ''));
  };

  const onSubmit: SubmitHandler<ProductFormSchemaType> = async (data) => {
    startTransition(async () => {
      const action = type === 'Create' ? createProduct : updateProduct;
      const res = await action({ ...data, id: productId || '' });
      if (!res.success) {
        toast.error(res.message);
      } else {
        toast.success(res.message);
        router.push(`/admin/products`);
      }
    });
  };

  return (
    <Form {...form}>
      <form
        method='post'
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter product name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='slug'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Slug</FormLabel>
                <div className='relative flex items-center gap-2'>
                  <FormControl>
                    <Input placeholder='Enter product slug' {...field} />
                  </FormControl>
                  <Button
                    type='button'
                    onClick={generateProductSlug}
                    variant='secondary'
                    size='sm'
                  >
                    Generate Slug
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='category'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder='Enter category' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='brand'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder='Enter product brand' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input placeholder='Enter product price' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Stock */}
          <FormField
            control={form.control}
            name='stock'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='Enter product stock'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='upload-field flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='images'
            render={({ field: { onChange, value: images } }) => (
              <FormItem className='w-full'>
                <FormLabel>Images</FormLabel>
                <Card>
                  <CardContent className='mt-2 min-h-48 space-y-2'>
                    <div className='flex-start space-x-2'>
                      {images.map((image: string) => (
                        <div key={image} className='flex flex-col items-center'>
                          <Image
                            key={image}
                            src={image}
                            alt='product image'
                            className='h-20 w-20 rounded-sm object-cover object-center'
                            width={100}
                            height={100}
                          />
                          <Button
                            type='button'
                            variant='link'
                            size='icon'
                            onClick={() =>
                              onChange(images.filter((i) => i !== image))
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <FormControl>
                        <UploadButton
                          endpoint='imageUploader'
                          onClientUploadComplete={(res: { url: string }[]) => {
                            onChange([...images, res[0].url]);
                          }}
                          onUploadError={(error: Error) => {
                            toast.error(`ERROR! ${error.message}`);
                          }}
                          appearance={{
                            button: buttonVariants({
                              variant: 'default',
                            }),
                            allowedContent: 'hidden',
                          }}
                        />
                      </FormControl>
                    </div>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className=''>
          Featured Product
          <Card>
            <CardContent className='mt-2 space-y-2'>
              <FormField
                control={form.control}
                name='isFeatured'
                render={({ field: { onChange, value, ...field } }) => (
                  <div>
                    <FormItem className='flex items-center gap-2'>
                      <FormControl>
                        <Checkbox
                          checked={value}
                          onCheckedChange={onChange}
                          {...field}
                        />
                      </FormControl>
                      <FormLabel>Is Featured?</FormLabel>
                    </FormItem>
                    {value && banner && (
                      <div className='flex flex-col items-center'>
                        <Image
                          src={banner}
                          alt='banner image'
                          className='w-full rounded-sm object-cover object-center'
                          width={1920}
                          height={680}
                        />
                        <Button
                          type='button'
                          variant='link'
                          size='icon'
                          onClick={() => {
                            form.setValue('banner', undefined);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                    {value && !banner && (
                      <UploadButton
                        endpoint='imageUploader'
                        onClientUploadComplete={(res: { url: string }[]) => {
                          form.setValue('banner', res[0].url);
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`ERROR! ${error.message}`);
                        }}
                        appearance={{
                          button: buttonVariants({
                            variant: 'default',
                          }),
                          allowedContent: 'hidden',
                        }}
                      />
                    )}
                  </div>
                )}
              />
            </CardContent>
          </Card>
        </div>
        <div>
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Enter product description'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <Button type='submit' disabled={isPending} className='space-x-1'>
            {isPending && <Loader className='h-4 w-4 animate-spin' />}
            {type === 'Create' ? 'Create Product' : 'Update Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
};
