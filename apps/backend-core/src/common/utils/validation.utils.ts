import { ValidationError } from 'class-validator';

const collectMessages = (error: ValidationError, messages: string[]): void => {
  if (error.constraints) {
    messages.push(...Object.values(error.constraints));
  }
  if (error.children && error.children.length > 0) {
    error.children.forEach((child) => collectMessages(child, messages));
  }
};

export const formatValidationErrors = (errors: ValidationError[]): string => {
  const messages: string[] = [];
  errors.forEach((error) => collectMessages(error, messages));
  return messages.length > 0 ? messages.join('; ') : 'Validation failed';
};
