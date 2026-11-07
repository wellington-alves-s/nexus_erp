import { ValidationOptions, registerDecorator } from 'class-validator';
import { cnpjValido } from './cnpj.js';

export function IsCnpj(options?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isCnpj',
      target: object.constructor,
      propertyName,
      options: { message: 'CNPJ inválido', ...options },
      validator: {
        validate: (value: unknown) =>
          typeof value === 'string' && cnpjValido(value),
      },
    });
  };
}
