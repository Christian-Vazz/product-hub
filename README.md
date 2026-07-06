# Smart Inventory Hub

Sistema inteligente de gerenciamento de inventário desenvolvido com arquitetura moderna e boas práticas de engenharia de software.

## Tecnologias

### Frontend
- **Vite** — Build tool rápida
- **React 18** + **TypeScript**
- **shadcn/ui** — Componentes acessíveis
- **Tailwind CSS** — Estilização utilitária
- **React Router** — Navegação SPA
- **Zustand** — Gerenciamento de estado
- **React Query** — Gerenciamento de dados assíncronos
- **Recharts** — Gráficos e visualizações

### Backend
- **Python 3.11+** + **FastAPI**
- **SQLAlchemy** — ORM
- **MySQL 8** — Banco de dados relacional
- **Docker** — Containerização

## Como rodar

### Pré-requisitos
- Node.js 18+ e npm
- Python 3.11+
- Docker e Docker Compose

### Frontend (desenvolvimento)

```sh
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

### Backend + Banco de Dados (Docker)

```sh
# Subir MySQL e Backend
docker compose up -d

# Acompanhar logs
docker compose logs -f backend
```

### Backend (desenvolvimento local)

```sh
cd backend

# Criar ambiente virtual
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # Linux/Mac

# Instalar dependências
pip install -r requirements.txt

# Rodar migrações
alembic upgrade head

# Iniciar servidor
uvicorn main:app --reload --port 8000
```

## Estrutura do Projeto

```
smart-inventory-hub/
├── src/                  # Frontend React
│   ├── api/              # Camada de comunicação com API
│   ├── components/       # Componentes reutilizáveis
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Páginas da aplicação
│   ├── routes/           # Configuração de rotas
│   ├── store/            # Estado global (Zustand)
│   └── types/            # Tipos TypeScript
├── backend/              # Backend Python/FastAPI
│   ├── app/
│   │   ├── api/          # Endpoints da API
│   │   ├── core/         # Configurações e segurança
│   │   ├── models/       # Modelos SQLAlchemy
│   │   ├── schemas/      # Schemas Pydantic
│   │   └── services/     # Lógica de negócio
│   ├── alembic/          # Migrações do banco
│   └── Dockerfile
├── docker-compose.yml    # Orquestração de containers
└── package.json          # Dependências do frontend
```