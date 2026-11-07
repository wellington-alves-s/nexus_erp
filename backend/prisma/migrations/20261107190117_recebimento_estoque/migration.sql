-- CreateEnum
CREATE TYPE "StatusConferencia" AS ENUM ('EM_CONFERENCIA', 'ENCERRADA');

-- CreateEnum
CREATE TYPE "TipoMovimentacaoEstoque" AS ENUM ('ENTRADA_MERCADORIA');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "StatusPedidoCompra" ADD VALUE 'PARCIALMENTE_RECEBIDO';
ALTER TYPE "StatusPedidoCompra" ADD VALUE 'RECEBIDO';

-- CreateTable
CREATE TABLE "conferencias_recebimento" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "numero" SERIAL NOT NULL,
    "pedidoId" UUID NOT NULL,
    "status" "StatusConferencia" NOT NULL DEFAULT 'EM_CONFERENCIA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "encerradaEm" TIMESTAMP(3),

    CONSTRAINT "conferencias_recebimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_conferencia" (
    "id" UUID NOT NULL,
    "conferenciaId" UUID NOT NULL,
    "itemPedidoId" UUID NOT NULL,
    "quantidadeConferida" DECIMAL(12,3) NOT NULL,
    "justificativaExcesso" TEXT,

    CONSTRAINT "itens_conferencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entradas_mercadoria" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "numero" SERIAL NOT NULL,
    "pedidoId" UUID NOT NULL,
    "conferenciaId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "entradas_mercadoria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_entrada" (
    "id" UUID NOT NULL,
    "entradaId" UUID NOT NULL,
    "itemPedidoId" UUID NOT NULL,
    "produtoId" UUID NOT NULL,
    "quantidade" DECIMAL(12,3) NOT NULL,

    CONSTRAINT "itens_entrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saldos_estoque" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "produtoId" UUID NOT NULL,
    "depositoId" UUID NOT NULL,
    "quantidade" DECIMAL(12,3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saldos_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimentacoes_estoque" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "produtoId" UUID NOT NULL,
    "depositoId" UUID NOT NULL,
    "tipo" "TipoMovimentacaoEstoque" NOT NULL,
    "quantidade" DECIMAL(12,3) NOT NULL,
    "entradaId" UUID NOT NULL,
    "itemEntradaId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conferencias_recebimento_pedidoId_idx" ON "conferencias_recebimento"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "conferencias_recebimento_empresaId_numero_key" ON "conferencias_recebimento"("empresaId", "numero");

-- CreateIndex
CREATE UNIQUE INDEX "itens_conferencia_conferenciaId_itemPedidoId_key" ON "itens_conferencia"("conferenciaId", "itemPedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "entradas_mercadoria_conferenciaId_key" ON "entradas_mercadoria"("conferenciaId");

-- CreateIndex
CREATE INDEX "entradas_mercadoria_pedidoId_idx" ON "entradas_mercadoria"("pedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "entradas_mercadoria_empresaId_numero_key" ON "entradas_mercadoria"("empresaId", "numero");

-- CreateIndex
CREATE INDEX "itens_entrada_itemPedidoId_idx" ON "itens_entrada"("itemPedidoId");

-- CreateIndex
CREATE UNIQUE INDEX "itens_entrada_entradaId_itemPedidoId_key" ON "itens_entrada"("entradaId", "itemPedidoId");

-- CreateIndex
CREATE INDEX "saldos_estoque_empresaId_idx" ON "saldos_estoque"("empresaId");

-- CreateIndex
CREATE UNIQUE INDEX "saldos_estoque_produtoId_depositoId_key" ON "saldos_estoque"("produtoId", "depositoId");

-- CreateIndex
CREATE UNIQUE INDEX "movimentacoes_estoque_itemEntradaId_key" ON "movimentacoes_estoque"("itemEntradaId");

-- CreateIndex
CREATE INDEX "movimentacoes_estoque_produtoId_depositoId_idx" ON "movimentacoes_estoque"("produtoId", "depositoId");

-- CreateIndex
CREATE INDEX "movimentacoes_estoque_entradaId_idx" ON "movimentacoes_estoque"("entradaId");

-- AddForeignKey
ALTER TABLE "conferencias_recebimento" ADD CONSTRAINT "conferencias_recebimento_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conferencias_recebimento" ADD CONSTRAINT "conferencias_recebimento_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_conferencia" ADD CONSTRAINT "itens_conferencia_conferenciaId_fkey" FOREIGN KEY ("conferenciaId") REFERENCES "conferencias_recebimento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_conferencia" ADD CONSTRAINT "itens_conferencia_itemPedidoId_fkey" FOREIGN KEY ("itemPedidoId") REFERENCES "itens_pedido_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entradas_mercadoria" ADD CONSTRAINT "entradas_mercadoria_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entradas_mercadoria" ADD CONSTRAINT "entradas_mercadoria_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entradas_mercadoria" ADD CONSTRAINT "entradas_mercadoria_conferenciaId_fkey" FOREIGN KEY ("conferenciaId") REFERENCES "conferencias_recebimento"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_entrada" ADD CONSTRAINT "itens_entrada_entradaId_fkey" FOREIGN KEY ("entradaId") REFERENCES "entradas_mercadoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_entrada" ADD CONSTRAINT "itens_entrada_itemPedidoId_fkey" FOREIGN KEY ("itemPedidoId") REFERENCES "itens_pedido_compra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_entrada" ADD CONSTRAINT "itens_entrada_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saldos_estoque" ADD CONSTRAINT "saldos_estoque_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saldos_estoque" ADD CONSTRAINT "saldos_estoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saldos_estoque" ADD CONSTRAINT "saldos_estoque_depositoId_fkey" FOREIGN KEY ("depositoId") REFERENCES "depositos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_depositoId_fkey" FOREIGN KEY ("depositoId") REFERENCES "depositos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_entradaId_fkey" FOREIGN KEY ("entradaId") REFERENCES "entradas_mercadoria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_itemEntradaId_fkey" FOREIGN KEY ("itemEntradaId") REFERENCES "itens_entrada"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
