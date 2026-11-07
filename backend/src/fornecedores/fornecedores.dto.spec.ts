import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AtualizarFornecedorDto, CriarFornecedorDto } from './fornecedores.dto.js';

async function validarCriacao(dados: object) {
  const dto = plainToInstance(CriarFornecedorDto, dados);
  return { dto, erros: await validate(dto) };
}

describe('CriarFornecedorDto', () => {
  it('normaliza CNPJ, telefone, CEP e UF', async () => {
    const { dto, erros } = await validarCriacao({
      razaoSocial: '  ACME Ltda ',
      cnpj: '11.222.333/0001-81',
      telefone: '(11) 91234-5678',
      cep: '01310-100',
      uf: 'sp',
    });
    expect(erros).toHaveLength(0);
    expect(dto).toMatchObject({
      razaoSocial: 'ACME Ltda',
      cnpj: '11222333000181',
      telefone: '11912345678',
      cep: '01310100',
      uf: 'SP',
    });
  });

  it('converte campos opcionais vazios em null', async () => {
    const { dto, erros } = await validarCriacao({
      razaoSocial: 'ACME',
      cnpj: '11222333000181',
      email: '  ',
      contatoNome: '',
    });
    expect(erros).toHaveLength(0);
    expect(dto.email).toBeNull();
    expect(dto.contatoNome).toBeNull();
  });

  it('rejeita CNPJ, telefone, UF e e-mail inválidos', async () => {
    const { erros } = await validarCriacao({
      razaoSocial: 'ACME',
      cnpj: '11222333000182',
      telefone: '123',
      uf: 'XX',
      email: 'x',
    });
    expect(erros.map((e) => e.property).sort()).toEqual([
      'cnpj',
      'email',
      'telefone',
      'uf',
    ]);
  });
});

describe('AtualizarFornecedorDto', () => {
  it('rejeita null em campos obrigatórios', async () => {
    const dto = plainToInstance(AtualizarFornecedorDto, {
      razaoSocial: null,
      cnpj: null,
      ativo: null,
    });
    const erros = await validate(dto);
    expect(erros.map((e) => e.property).sort()).toEqual(['ativo', 'cnpj', 'razaoSocial']);
  });

  it('aceita corpo parcial', async () => {
    const dto = plainToInstance(AtualizarFornecedorDto, { ativo: false });
    expect(await validate(dto)).toHaveLength(0);
  });
});
