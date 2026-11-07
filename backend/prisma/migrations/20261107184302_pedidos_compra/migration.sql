-- CreateEnum
CREATE TYPE "StatusPedidoCompra" AS ENUM ('ABERTO');

-- CreateTable
CREATE TABLE "depositos" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "depositos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos_compra" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "numero" SERIAL NOT NULL,
    "fornecedorId" UUID NOT NULL,
    "depositoId" UUID NOT NULL,
    "status" "StatusPedidoCompra" NOT NULL DEFAULT 'ABERTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itens_pedido_compra" (
    "id" UUID NOT NULL,
    "pedidoId" UUID NOT NULL,
    "produtoId" UUID NOT NULL,
    "quantidade" DECIMAL(12,3) NOT NULL,
    "precoUnitario" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "itens_pedido_compra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "depositos_empresaId_idx" ON "depositos"("empresaId");

-- CreateIndex
CREATE INDEX "pedidos_compra_fornecedorId_idx" ON "pedidos_compra"("fornecedorId");

-- CreateIndex
CREATE UNIQUE INDEX "pedidos_compra_empresaId_numero_key" ON "pedidos_compra"("empresaId", "numero");

-- CreateIndex
CREATE INDEX "itens_pedido_compra_produtoId_idx" ON "itens_pedido_compra"("produtoId");

-- CreateIndex
CREATE UNIQUE INDEX "itens_pedido_compra_pedidoId_produtoId_key" ON "itens_pedido_compra"("pedidoId", "produtoId");

-- AddForeignKey
ALTER TABLE "depositos" ADD CONSTRAINT "depositos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_compra" ADD CONSTRAINT "pedidos_compra_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_compra" ADD CONSTRAINT "pedidos_compra_fornecedorId_fkey" FOREIGN KEY ("fornecedorId") REFERENCES "fornecedores"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos_compra" ADD CONSTRAINT "pedidos_compra_depositoId_fkey" FOREIGN KEY ("depositoId") REFERENCES "depositos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido_compra" ADD CONSTRAINT "itens_pedido_compra_pedidoId_fkey" FOREIGN KEY ("pedidoId") REFERENCES "pedidos_compra"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itens_pedido_compra" ADD CONSTRAINT "itens_pedido_compra_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "produtos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Depósito inicial da empresa única
INSERT INTO "depositos" ("id", "empresaId", "nome")
VALUES (gen_random_uuid(), '00000000-0000-4000-8000-000000000001', 'Depósito principal');
