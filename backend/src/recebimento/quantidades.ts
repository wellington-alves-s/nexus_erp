import { Prisma, StatusPedidoCompra } from '../generated/prisma/client.js';

type Decimal = Prisma.Decimal;

export function somar(quantidades: Decimal[]): Decimal {
  return quantidades.reduce((soma, quantidade) => soma.plus(quantidade), new Prisma.Decimal(0));
}

/** Quantidade ainda não recebida; nunca negativa, mesmo havendo excedente. */
export function calcularPendente(pedida: Decimal, recebida: Decimal): Decimal {
  const pendente = pedida.minus(recebida);
  return pendente.isNegative() ? new Prisma.Decimal(0) : pendente;
}

export function statusDoPedido(
  itens: { pedida: Decimal; recebida: Decimal }[],
): StatusPedidoCompra {
  if (itens.length > 0 && itens.every((item) => item.recebida.gte(item.pedida))) {
    return StatusPedidoCompra.RECEBIDO;
  }
  return itens.some((item) => item.recebida.gt(0))
    ? StatusPedidoCompra.PARCIALMENTE_RECEBIDO
    : StatusPedidoCompra.ABERTO;
}
