import { Transform } from 'class-transformer';

/** Remove espaços nas extremidades de textos. */
export const Aparar = () =>
  Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  );

/** Remove espaços nas extremidades e converte texto vazio em null. */
export const VazioParaNulo = () =>
  Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    const texto = value.trim();
    return texto === '' ? null : texto;
  });

/** Mantém apenas dígitos; texto vazio vira null. */
export const SomenteDigitos = () =>
  Transform(({ value }: { value: unknown }) => {
    if (typeof value !== 'string') return value;
    const digitos = value.replace(/\D/g, '');
    return digitos === '' ? null : digitos;
  });
