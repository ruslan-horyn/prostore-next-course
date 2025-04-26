import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertToPlainObject = <T>(obj: unknown): T => {
  return JSON.parse(JSON.stringify(obj)) as T;
};

export const formatNumberWithDecimals = (number: number) => {
  return number.toFixed(2);
};
