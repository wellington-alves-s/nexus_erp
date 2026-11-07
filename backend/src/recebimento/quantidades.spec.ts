import { Prisma } from '../generated/prisma/client.js';
import { calcularPendente, somar, statusDoPedido } from './quantidades.js';

const d = (valor: string) => new Prisma.Decimal(valor);

describe('calcularPendente', () => {
  it('subtrai o recebido do pedido', () => {
    expect(calcularPendente(d('10'), d('2.5')).toFixed(3)).toBe('7.500');
  });

  it('não fica negativo quando há excedente', () => {
    expect(calcularPendente(d('10'), d('12')).toFixed(3)).toBe('0.000');
  });
});

describe('somar', () => {
  it('soma sem erro de ponto flutuante', () => {
    expect(somar([d('0.1'), d('0.2')]).toFixed(3)).toBe('0.300');
  });
});

describe('statusDoPedido', () => {
  it('é ABERTO sem recebimentos', () => {
    expect(statusDoPedido([{ pedida: d('5'), recebida: d('0') }])).toBe('ABERTO');
  });

  it('é PARCIALMENTE_RECEBIDO quando algum item ainda tem pendente', () => {
    expect(
      statusDoPedido([
        { pedida: d('5'), recebida: d('5') },
        { pedida: d('3'), recebida: d('1') },
      ]),
    ).toBe('PARCIALMENTE_RECEBIDO');
  });

  it('é RECEBIDO quando todos os itens atingem o pedido, inclusive com excedente', () => {
    expect(
      statusDoPedido([
        { pedida: d('5'), recebida: d('6') },
        { pedida: d('3'), recebida: d('3') },
      ]),
    ).toBe('RECEBIDO');
  });
});
