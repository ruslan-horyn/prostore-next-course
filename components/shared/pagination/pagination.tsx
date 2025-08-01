'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn, formUrlQuery } from '@/lib/utils';

type PaginationProps = React.ComponentProps<'div'> & {
  page: number | undefined;
  totalPages: number | undefined;
  urlParamName?: string;
};

export const Pagination = ({
  page = 1,
  totalPages = 1,
  urlParamName,
  className,
  ...props
}: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const onClick = (btnType: string) => {
    const pageValue = btnType === 'next' ? Number(page) + 1 : Number(page) - 1;

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: urlParamName || 'page',
      value: pageValue.toString(),
    });

    router.push(newUrl, { scroll: false });
  };

  if (totalPages <= 1) return null;

  return (
    <div {...props} className={cn('flex gap-2', className)}>
      <Button
        size='sm'
        variant='outline'
        className='w-28'
        onClick={() => onClick('prev')}
        disabled={Number(page) <= 1}
      >
        Previous
      </Button>
      <Button
        size='sm'
        variant='outline'
        className='w-28'
        onClick={() => onClick('next')}
        disabled={Number(page) >= totalPages}
      >
        Next
      </Button>
    </div>
  );
};
