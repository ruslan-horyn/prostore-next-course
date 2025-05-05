import { PrismaClientKnownRequestError } from '@app-prisma/runtime/library';
import { ZodError } from 'zod';

export const isZodError = (error: unknown): error is ZodError => {
  return error instanceof ZodError;
};

export const handleZodError = (error: ZodError): string => {
  const messages = error.issues.map((issue) => issue.message);
  return messages.join('. ');
};

export const isPrismaClientKnownRequestError = (
  error: unknown
): error is PrismaClientKnownRequestError => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'PrismaClientKnownRequestError'
  ) {
    return true;
  }

  return false;
};

export const handlePrismaClientKnownRequestError = (
  error: PrismaClientKnownRequestError
): string => {
  switch (error.code) {
    case 'P2002': // Unique constraint violation
      const targets = error.meta?.target as string[] | undefined;
      const fieldName = targets?.[0] ?? 'Field';
      return `${
        fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
      } already exists`;
    case 'P2025': // Record not found
      return 'Record not found';
    case 'P2003': // Foreign key constraint failed
      return 'Related record not found';
    case 'P2001': // Record does not exist
      return "The record you're trying to update doesn't exist";
    case 'P2014': // The provided ID is invalid
      return 'Invalid ID provided';
    case 'P2021': // The table does not exist
      return 'Database error: table not found';
    case 'P2023': // Inconsistent column data
      return 'Invalid data format';
    default:
      return `Database error: ${error.message}`;
  }
};

export const formatError = (error: unknown): string => {
  if (isZodError(error)) {
    return handleZodError(error);
  }

  if (isPrismaClientKnownRequestError(error)) {
    return handlePrismaClientKnownRequestError(error);
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
};
