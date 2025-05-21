import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import qs from 'query-string';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertToPlainObject = <R, T = unknown>(obj: T): R => {
  return JSON.parse(JSON.stringify(obj)) as R;
};

export const roundTwo = (value: number | string) => {
  const isString = typeof value === 'string';
  const numberValue = isString ? Number(value) : value;

  return Math.round((numberValue + Number.EPSILON) * 100) / 100;
};

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency',
  minimumFractionDigits: 2,
});

export function formatCurrency(amount: number | string | null | undefined) {
  if (!amount || isNaN(Number(amount))) return 'NaN';
  return CURRENCY_FORMATTER.format(Number(amount));
}

// Shorten ID
export function formatId(id: string) {
  return `..${id.substring(id.length - 6)}`;
}

export const formatDateTime = (dateString: Date) => {
  const dateTimeOptions: Intl.DateTimeFormatOptions = {
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // abbreviated month name (e.g., 'Oct')
    day: 'numeric', // numeric day of the month (e.g., '25')
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: true, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'short', // abbreviated weekday name (e.g., 'Mon')
    month: 'short', // abbreviated month name (e.g., 'Oct')
    year: 'numeric', // numeric year (e.g., '2023')
    day: 'numeric', // numeric day of the month (e.g., '25')
  };
  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric', // numeric hour (e.g., '8')
    minute: 'numeric', // numeric minute (e.g., '30')
    hour12: false, // use 12-hour clock (true) or 24-hour clock (false)
  };
  const formattedDateTime: string = new Date(dateString).toLocaleString(
    'en-US',
    dateTimeOptions
  );
  const formattedDate: string = new Date(dateString).toLocaleString(
    'en-US',
    dateOptions
  );
  const formattedTime: string = new Date(dateString).toLocaleString(
    'en-US',
    timeOptions
  );
  return {
    dateTime: formattedDateTime,
    dateOnly: formattedDate,
    timeOnly: formattedTime,
  };
};

export const calculateTotalPages = ({
  count,
  limit,
}: {
  count: number;
  limit: number;
}) => {
  if (count <= 0) return 1;
  return Math.ceil(count / limit);
};

export function formUrlQuery({
  params,
  key,
  value,
}: {
  params: string;
  key: string;
  value: string | null;
}) {
  const query = qs.parse(params);

  query[key] = value;

  return qs.stringifyUrl(
    {
      url: window.location.pathname,
      query,
    },
    { skipNull: true }
  );
}
