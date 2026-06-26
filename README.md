# AgroSync — Backend

Backend do AgroSync em arquitetura de microserviços. 6 serviços Express/TypeScript + API Gateway, PostgreSQL 16, RabbitMQ 3.13 — tudo orquestrado via Docker Compose.

---

## Arquitetura

```
Cliente (React)
       │
       ▼
  API Gateway :3000
       │
  ┌────┼──────────────────────────┐
  ▼    ▼        ▼        ▼        ▼
auth  garden  supply   task      ai
:3001 :3002   :3003    :3004    :3005
  │    │        │        │
  └────┴────────┴────────┴──► PostgreSQL :5432
       │        │
       └────────┴──────────► RabbitMQ :5672
                                    │
                                    ▼
                           notification-service (worker)
```

---

## Serviços

| Serviço | Porta | Responsabilidade |
|---|---|---|
| api-gateway | 3000 | Proxy reverso para os microserviços |
| auth-service | 3001 | Autenticação JWT, usuários, organizações |
| garden-service | 3002 | Canteiros, planos, colheitas, diário, dashboard |
| supply-service | 3003 | Estoque de insumos, movimentações, categorias |
| task-service | 3004 | Tarefas com prioridade e status |
| ai-service | 3005 | Chat com assistente IA (DeepSeek) |
| notification-service | — | Worker de eventos RabbitMQ |
| PostgreSQL | 5432 | Banco de dados principal |
| RabbitMQ | 5672 / 15672 | Message broker + painel de gestão |

---

## Pré-requisitos

- Docker Desktop 4.x
- Docker Compose v2+

---

## Variáveis de Ambiente

Crie `.env` na raiz deste diretório:

```env
# Autenticação
JWT_SECRET=troque_por_um_secret_longo_e_aleatorio

# Banco de dados
POSTGRES_USER=agrosync
POSTGRES_PASSWORD=agrosync_secret
POSTGRES_DB=agrosync_db

# RabbitMQ
RABBITMQ_DEFAULT_USER=agrosync
RABBITMQ_DEFAULT_PASS=rabbit_secret

# IA (obrigatório para o assistente funcionar)
DEEPSEEK_API_KEY=sua_chave_aqui
```

---

## Instalação

```bash
# Subir todos os serviços
docker compose up -d --build

# Verificar status (RabbitMQ leva ~90s para ficar healthy)
docker compose ps
```

### Acessos

| Serviço | URL | Credenciais |
|---|---|---|
| API Gateway | `http://localhost:3000` | — |
| RabbitMQ UI | `http://localhost:15672` | agrosync / rabbit_secret |
| PostgreSQL | `localhost:5432` | agrosync / agrosync_secret |

---

## Comandos úteis

```bash
# Logs em tempo real
docker compose logs -f garden-service

# Reiniciar um serviço
docker compose restart api-gateway

# Parar (preserva o banco)
docker compose down

# Parar e apagar o banco
docker compose down -v

# Aplicar schema no banco
docker compose exec auth-service npx prisma db push
```

---

## Tabela de Rotas

Todas as rotas passam pelo API Gateway em `http://localhost:3000`. JWT obrigatório exceto em `/api/auth/register` e `/api/auth/login`.

### Autenticação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Cria usuário e organização |
| POST | `/api/auth/login` | Autentica, retorna JWT |
| GET | `/api/auth/me` | Dados do usuário logado |

### Canteiros
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/gardens` | Lista canteiros |
| POST | `/api/gardens` | Cria canteiro |
| PUT | `/api/gardens/:id` | Atualiza canteiro |
| DELETE | `/api/gardens/:id` | Remove canteiro |
| POST | `/api/gardens/calculate-stand` | Calcula estande e produção estimada |
| POST | `/api/harvest` | Registra colheita |
| GET | `/api/harvest/garden/:id` | Histórico de colheitas |
| POST | `/api/journals` | Adiciona entrada ao diário |
| GET | `/api/journals/garden/:id` | Lista entradas do diário |

### Planos de Cultivo
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/crop-plans` | Lista planos |
| POST | `/api/crop-plans` | Cria plano |
| PUT | `/api/crop-plans/:id` | Atualiza plano |
| DELETE | `/api/crop-plans/:id` | Remove plano |
| POST | `/api/crop-cycles` | Inicia ciclo produtivo |

### Insumos
| Método | Rota | Descrição |
|---|---|---|
| GET/POST | `/api/supplies` | Lista / cria insumo |
| PUT/DELETE | `/api/supplies/:id` | Atualiza / remove |
| GET | `/api/supplies/:id/transactions` | Extrato de movimentações |
| GET/POST | `/api/supplies/categories` | Categorias |
| GET/POST | `/api/supplies/units` | Unidades de medida |
| POST | `/api/usage/apply` | Aplica insumo em canteiro |
| GET | `/api/usage/history/:gardenId` | Histórico de aplicações |

### Tarefas
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/tasks` | Lista tarefas |
| GET | `/api/tasks/today` | Tarefas do dia |
| GET | `/api/tasks/garden/:id` | Tarefas de um canteiro |
| POST | `/api/tasks` | Cria tarefa |
| PUT | `/api/tasks/:id` | Atualiza tarefa |
| PATCH | `/api/tasks/:id/status` | Atualiza só o status |
| DELETE | `/api/tasks/:id` | Remove tarefa |

### IA e Utilitários
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/ask-ai` | Envia pergunta ao assistente |
| GET | `/api/ai/history` | Histórico de conversas |
| GET | `/api/dashboard/stats` | KPIs consolidados |
| GET | `/api/search?q=termo` | Busca global |
| GET | `/health` | Health check do gateway |

---

## Mensageria (RabbitMQ)

Exchange: `agrosync.events` (topic)

| Evento | Publicado por | Descrição |
|---|---|---|
| `supply.low_stock` | supply-service | Estoque abaixo do mínimo |
| `crop_cycle.started` | garden-service | Novo ciclo iniciado |
| `harvest.recorded` | garden-service | Colheita registrada |
| `garden.created` | garden-service | Canteiro cadastrado |

---

## Banco de Dados

PostgreSQL 16 acessado via Prisma ORM. Principais modelos: `Organization`, `User`, `Membership`, `Garden`, `CropPlan`, `CropCycle`, `Supply`, `SupplyTransaction`, `Task`, `JournalEntry`, `Harvest`, `AIMessage`.

```bash
# Aplicar schema (desenvolvimento)
docker compose exec auth-service npx prisma db push

# Deploy de migrations (produção)
docker compose exec auth-service npx prisma migrate deploy
```

---

## Deploy

O deploy é feito automaticamente via GitHub Actions ao fazer push para `main`.

O workflow (`.github/workflows/deploy-production.yml`) conecta ao VPS por SSH, faz `git pull`, `npm install`, `npm run build`, `prisma migrate deploy` e reinicia o processo via PM2.
