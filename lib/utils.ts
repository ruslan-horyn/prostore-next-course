import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
