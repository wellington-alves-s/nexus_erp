# NEXUS ERP

Sistema ERP modular para gestão de operações comerciais, compras e estoque.

## Stack
- TypeScript
- Frontend: React + Next.js
- Backend/API: NestJS
- Banco de dados: PostgreSQL 16
- ORM: Prisma
- Interface: Tailwind CSS + shadcn/ui
- Infraestrutura: Docker
- Versionamento: Git + GitHub

## Estrutura
- `frontend/`: aplicação web (Next.js).
- `backend/`: API e regras de negócio (NestJS, Prisma).
- `infra/docker/`: Dockerfiles de desenvolvimento.
- `docker-compose.yml`: ambiente local (PostgreSQL, backend e frontend).
- `.env.example`: variáveis de ambiente de referência.

## Executando o ambiente

### Pré-requisitos

- Git
- Docker com Docker Compose (caminho recomendado; já inclui Node.js e PostgreSQL)
- Para rodar fora do Docker: Node.js 22 e npm

### Primeira execução (Docker)

```bash
git clone https://github.com/wellington-alves-s/nexus_erp.git
cd nexus_erp
docker compose up -d --build
docker compose exec backend npx prisma migrate deploy
```

O `docker compose up --build` instala as dependências (`npm ci`) dentro das imagens e gera o cliente Prisma na inicialização do backend. As migrations não são aplicadas automaticamente: o comando `prisma migrate deploy` cria as tabelas, a empresa única e o depósito inicial. Ele é necessário na primeira execução e depois de baixar novas migrations.

Para alterar portas ou credenciais, copie `.env.example` para `.env` na raiz antes de subir o ambiente.

| Serviço | Endereço |
|---|---|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:3001 |
| Verificação da API e do banco | http://localhost:3001/health |
| PostgreSQL | localhost:5432 |

Parar o ambiente: `docker compose down` (adicione `-v` para apagar também os dados do banco).

## Comandos úteis

Os comandos de Prisma usam `DATABASE_URL`, já definida no container do backend:

```bash
docker compose exec backend npx prisma migrate dev --name <nome>
docker compose exec backend npx prisma generate
docker compose exec backend npm test
docker compose logs -f backend
```

### Executando fora do Docker

Mantenha apenas o banco no Docker (`docker compose up -d postgres`) ou use um PostgreSQL 16 próprio. Em dois terminais:

```bash
# backend
cd backend
npm ci
echo 'DATABASE_URL=postgresql://nexus:nexus@localhost:5432/nexus_erp?schema=public' > .env
npx prisma migrate deploy
npx prisma generate
npm run start:dev
```

```bash
# frontend
cd frontend
npm ci
npm run dev
```

O backend usa a porta 3001 e o frontend a 3000. Se alterar a porta da API, defina `NEXT_PUBLIC_API_URL` no ambiente do frontend (padrão `http://localhost:3001`) e `CORS_ORIGIN` no do backend.

O cliente Prisma é gerado em `backend/src/generated/` (ignorado pelo Git) e recriado na inicialização do container.

## Dependências nos containers

`node_modules` fica em volumes nomeados. Depois de adicionar ou atualizar dependências, instale também dentro do container (ou recrie os volumes com `docker compose down -v`):

```bash
docker compose exec backend npm install
docker compose exec frontend npm install
```

O backend não recarrega sozinho no Docker em Windows: após alterar o código, use `docker compose restart backend`.

## API de cadastros

| Método | Rota | Descrição |
|---|---|---|
| GET | `/produtos?page=&pageSize=&busca=` | Lista paginada; busca por código ou nome |
| GET, POST, PATCH | `/produtos`, `/produtos/:id` | Consulta, criação e edição (inclui `ativo`) |
| GET | `/fornecedores?page=&pageSize=&busca=` | Lista paginada; busca por razão social ou CNPJ |
| GET, POST, PATCH | `/fornecedores`, `/fornecedores/:id` | Consulta, criação e edição (inclui `ativo`) |

O código do produto é gerado pelo banco. CNPJ, telefone e CEP são normalizados no backend (CNPJ com 14 caracteres, alfanumérico, sem pontuação). A empresa única é criada pela migration inicial.

### Compras

| Método | Rota | Descrição |
|---|---|---|
| GET | `/depositos` | Depósitos ativos |
| GET, POST | `/pedidos-compra`, `/pedidos-compra/:id` | Listagem paginada, consulta e criação (sem edição); o total é calculado pela API |

As listagens de produtos e fornecedores aceitam `ativo=true|false`. O depósito inicial é criado pela migration `pedidos_compra`.

### Recebimento e estoque

| Método | Rota | Descrição |
|---|---|---|
| POST | `/pedidos-compra/:id/conferencias` | Abre uma conferência (no máximo uma não efetivada por pedido) |
| GET | `/conferencias/:id` | Consulta, com recebido e pendente por item |
| PUT | `/conferencias/:id/itens` | Substitui os itens conferidos (apenas em conferência) |
| POST | `/conferencias/:id/encerrar` | Encerra; excedente exige justificativa |
| POST, GET | `/entradas-mercadoria`, `/entradas-mercadoria/:id` | Efetiva a entrada de uma conferência encerrada e consulta |
| GET | `/estoque?busca=&depositoId=` | Saldo por produto e depósito |

A conferência não altera o estoque. A efetivação da entrada grava entrada, movimentações, saldo e status do pedido em uma única transação.

### Testes

```bash
docker compose exec backend npm test        # unitários
cd backend && npm run test:int              # integração, exige o banco nexus_erp_test e `npm ci` no host
```

Criação do banco de testes (uma vez):

```bash
docker compose exec postgres createdb -U nexus nexus_erp_test
cd backend && DATABASE_URL="postgresql://nexus:nexus@localhost:5432/nexus_erp_test?schema=public" npx prisma migrate deploy
```
