const FORMATO = /^[0-9A-Z]{12}[0-9]{2}$/;
const PESO_PRIMEIRO_DIGITO = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const PESO_SEGUNDO_DIGITO = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

/** Remove a pontuação (. / -) e espaços e converte para maiúsculas. */
export function normalizarCnpj(valor: string): string {
  return valor.replace(/[.\-/\s]/g, '').toUpperCase();
}

// Cada caractere vale seu código ASCII menos 48, o que mantém os CNPJs
// numéricos válidos e atende o formato alfanumérico (IN RFB 2.229/2024).
function digitoVerificador(base: string, pesos: number[]): number {
  const soma = pesos.reduce(
    (total, peso, i) => total + (base.charCodeAt(i) - 48) * peso,
    0,
  );
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

export function cnpjValido(valor: string): boolean {
  if (!FORMATO.test(valor) || /^(.)\1{13}$/.test(valor)) {
    return false;
  }
  const primeiro = digitoVerificador(valor.slice(0, 12), PESO_PRIMEIRO_DIGITO);
  const segundo = digitoVerificador(valor.slice(0, 13), PESO_SEGUNDO_DIGITO);
  return valor.endsWith(`${primeiro}${segundo}`);
}
