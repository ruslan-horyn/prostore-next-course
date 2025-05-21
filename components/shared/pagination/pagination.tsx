'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn, formUrlQuery } from '@/lib/utils';

type PaginationProps = React.ComponentProps<'div'> & {
  page: number | string;
  totalPages: number;
  urlParamName?: string;
};

export const Pagination = ({
  page,
  totalPages,
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

  return (
    <div {...props} className={cn('flex gap-2', className)}>
      <Button
        size='lg'
        variant='outline'
        className='w-28'
        onClick={() => onClick('prev')}
        disabled={Number(page) <= 1}
      >
        Previous
      </Button>
      <Button
        size='lg'
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
