import { Prisma } from '../generated/prisma/client.js';

/**
 * Serializa as operações de recebimento de um mesmo pedido. Sem o bloqueio, as
 * verificações de estado (conferência única, conferência editável, status do
 * pedido) seriam sujeitas a condição de corrida.
 */
export async function bloquearPedido(
  tx: Prisma.TransactionClient,
  pedidoId: string,
): Promise<void> {
  await tx.$queryRaw`SELECT id FROM pedidos_compra WHERE id = ${pedidoId}::uuid FOR UPDATE`;
}
