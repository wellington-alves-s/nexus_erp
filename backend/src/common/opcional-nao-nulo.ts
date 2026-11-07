import { ValidateIf } from 'class-validator';

/** Campo pode ser omitido, mas, se enviado, não pode ser null e é validado. */
export const OpcionalNaoNulo = () =>
  ValidateIf((_objeto, valor: unknown) => valor !== undefined);
