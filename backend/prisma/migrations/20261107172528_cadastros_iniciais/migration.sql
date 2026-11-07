-- CreateEnum
CREATE TYPE "UnidadeMedida" AS ENUM ('UN', 'CX', 'BR', 'PCT', 'M2');

-- CreateTable
CREATE TABLE "empresas" (
    "id" UUID NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "empresas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "produtos" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "codigo" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "unidade" "UnidadeMedida" NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "produtos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecedores" (
    "id" UUID NOT NULL,
    "empresaId" UUID NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT,
    "cnpj" CHAR(14) NOT NULL,
    "email" TEXT,
    "telefone" TEXT,
    "logradouro" TEXT,
    "cidade" TEXT,
    "uf" CHAR(2),
    "cep" CHAR(8),
    "contatoNome" TEXT,
    "contatoEmail" TEXT,
    "contatoTelefone" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fornecedores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "produtos_empresaId_nome_idx" ON "produtos"("empresaId", "nome");

-- CreateIndex
CREATE UNIQUE INDEX "produtos_empresaId_codigo_key" ON "produtos"("empresaId", "codigo");

-- CreateIndex
CREATE INDEX "fornecedores_empresaId_razaoSocial_idx" ON "fornecedores"("empresaId", "razaoSocial");

-- CreateIndex
CREATE UNIQUE INDEX "fornecedores_empresaId_cnpj_key" ON "fornecedores"("empresaId", "cnpj");

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecedores" ADD CONSTRAINT "fornecedores_empresaId_fkey" FOREIGN KEY ("empresaId") REFERENCES "empresas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Empresa única, ver src/common/empresa-padrao.ts
INSERT INTO "empresas" ("id", "nome") VALUES ('00000000-0000-4000-8000-000000000001', 'Empresa padrão');
