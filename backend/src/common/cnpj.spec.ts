import { cnpjValido, normalizarCnpj } from './cnpj.js';

describe('normalizarCnpj', () => {
  it('remove pontuação e converte para maiúsculas', () => {
    expect(normalizarCnpj('12.abc.345/01de-35')).toBe('12ABC34501DE35');
  });
});

describe('cnpjValido', () => {
  it('aceita CNPJ numérico válido', () => {
    expect(cnpjValido('11222333000181')).toBe(true);
  });

  it('aceita CNPJ alfanumérico válido', () => {
    expect(cnpjValido('12ABC34501DE35')).toBe(true);
  });

  it('rejeita dígito verificador incorreto', () => {
    expect(cnpjValido('11222333000182')).toBe(false);
    expect(cnpjValido('12ABC34501DE36')).toBe(false);
  });

  it('rejeita sequência de caracteres iguais', () => {
    expect(cnpjValido('00000000000000')).toBe(false);
  });

  it('rejeita tamanho e formato inválidos', () => {
    expect(cnpjValido('1122233300018')).toBe(false);
    expect(cnpjValido('11222333000AB1')).toBe(false);
    expect(cnpjValido('11.222.333/0001-81')).toBe(false);
  });
});
