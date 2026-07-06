# 📦 Smart Inventory Hub — Backend API

> A robust, scalable REST API for intelligent inventory management built with **FastAPI**, **SQLAlchemy**, **MySQL**, and **Docker**.

---

## 🏗️ Architecture

This backend follows **Clean Architecture** principles with clear layer separation:

```
backend/
├── app/
│   ├── api/v1/               # Presentation layer (endpoints)
│   │   ├── endpoints/
│   │   │   ├── products.py        # Product CRUD
│   │   │   ├── stock_movements.py # Stock movement operations
│   │   │   └── dashboard.py       # Analytics & reporting
│   │   └── router.py             # API router aggregation
│   │
│   ├── core/                  # Infrastructure layer
│   │   ├── config.py              # Environment settings
│   │   ├── database.py            # SQLAlchemy engine & session
│   │   ├── exceptions.py         # Custom exceptions & handlers
│   │   ├── security.py           # JWT & password utilities
│   │   └── logging.py            # Structured logging
│   │
│   ├── models/                # Domain layer (ORM models)
│   │   ├── product.py
│   │   └── stock_movement.py
│   │
│   ├── schemas/               # DTO layer (Pydantic schemas)
│   │   ├── product.py
│   │   ├── stock_movement.py
│   │   └── dashboard.py
│   │
│   ├── repositories/          # Data access layer
│   │   ├── product_repository.py
│   │   └── stock_movement_repository.py
│   │
│   ├── services/              # Business logic layer
│   │   ├── product_service.py
│   │   ├── stock_service.py
│   │   └── dashboard_service.py
│   │
│   └── utils/
│       └── enums.py
│
├── tests/                     # Integration tests
├── requirements.txt
├── Dockerfile
└── main.py                   # Application entry point

└── .env.example
```

---

## 🚀 Quick Start

### Prerequisites

- **Docker** and **Docker Compose** installed
- OR **Python 3.12+** and **MySQL 8.0+** installed locally

### Option 1: Docker (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/Christian-Vazz/smart-inventory-hub.git
cd smart-inventory-hub

# 2. Start all services
docker-compose up --build

# 3. Access the API
#    Swagger UI: http://localhost:8000/docs
#    ReDoc:      http://localhost:8000/redoc
#    Health:     http://localhost:8000/health
```

### Option 2: Local Development

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create a virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate  # Linux/Mac

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
copy .env.example .env
# Edit .env with your MySQL credentials

# 5. Run database migrations
alembic upgrade head

# 6. Start the development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📡 API Endpoints

### Products

| Method   | Endpoint                 | Description           |
|----------|--------------------------|-----------------------|
| `POST`   | `/api/v1/products`       | Create a new product  |
| `GET`    | `/api/v1/products`       | List products (paginated) |
| `GET`    | `/api/v1/products/{id}`  | Get product details   |
| `PUT`    | `/api/v1/products/{id}`  | Update a product      |
| `DELETE` | `/api/v1/products/{id}`  | Delete a product      |

### Stock Movements

| Method | Endpoint                       | Description              |
|--------|--------------------------------|--------------------------|
| `POST` | `/api/v1/stock-movements`      | Create a movement        |
| `GET`  | `/api/v1/stock-movements`      | List movements (paginated) |
| `GET`  | `/api/v1/stock-movements/{id}` | Get movement details     |

### Dashboard

| Method | Endpoint                        | Description                |
|--------|---------------------------------|----------------------------|
| `GET`  | `/api/v1/dashboard/summary`     | Aggregated inventory stats |
| `GET`  | `/api/v1/dashboard/movements`   | Movement trends by period  |
| `GET`  | `/api/v1/dashboard/low-stock`   | Low stock alerts           |

### Health

| Method | Endpoint   | Description     |
|--------|------------|-----------------|
| `GET`  | `/health`  | Health check    |

---

## 📊 Data Model

### Products

| Column         | Type           | Constraints          |
|----------------|----------------|----------------------|
| `id`           | INT            | PK, AUTO_INCREMENT   |
| `name`         | VARCHAR(255)   | NOT NULL, INDEX      |
| `description`  | TEXT           | NULLABLE             |
| `category`     | VARCHAR(50)    | NOT NULL, INDEX      |
| `sku`          | VARCHAR(100)   | UNIQUE, NOT NULL     |
| `quantity`     | INT            | NOT NULL, DEFAULT 0  |
| `minimum_stock`| INT            | NOT NULL, DEFAULT 0  |
| `price`        | FLOAT          | NOT NULL, DEFAULT 0  |
| `created_at`   | DATETIME(tz)   | AUTO                 |
| `updated_at`   | DATETIME(tz)   | AUTO ON UPDATE       |

### Stock Movements

| Column             | Type           | Constraints              |
|--------------------|----------------|--------------------------|
| `id`               | INT            | PK, AUTO_INCREMENT       |
| `product_id`       | INT            | FK → products.id         |
| `movement_type`    | VARCHAR(20)    | ENTRY / EXIT / ADJUSTMENT|
| `quantity`          | INT            | NOT NULL                 |
| `user_responsible`  | VARCHAR(255)   | NOT NULL                 |
| `observation`       | TEXT           | NULLABLE                 |
| `created_at`        | DATETIME(tz)   | AUTO                     |

---

## 🧪 Business Rules

### Stock Movements

| Type         | Behavior                                        |
|--------------|------------------------------------------------|
| **ENTRY**    | Adds quantity to product stock                  |
| **EXIT**     | Subtracts from stock (cannot go negative)       |
| **ADJUSTMENT** | Sets stock to the specified quantity          |

- Every movement is immutable and recorded in history
- Product stock is automatically updated on each movement
- EXIT operations validate available stock before proceeding

---

## 🧪 Running Tests

```bash
cd backend
pip install -r requirements.txt
pytest -v
```

---

## 🔧 Environment Variables

| Variable                        | Default                    | Description                   |
|---------------------------------|----------------------------|-------------------------------|
| `DB_HOST`                       | `localhost`                | MySQL host                    |
| `DB_PORT`                       | `3306`                     | MySQL port                    |
| `DB_USER`                       | `inventory_user`           | MySQL user                    |
| `DB_PASSWORD`                   | `inventory_pass`           | MySQL password                |
| `DB_NAME`                       | `smart_inventory`          | MySQL database name           |
| `APP_ENV`                       | `development`              | Environment                   |
| `APP_DEBUG`                     | `true`                     | Debug mode                    |
| `SECRET_KEY`                    | (change in prod)           | JWT secret key                |
| `CORS_ORIGINS`                  | `http://localhost:5173,...` | Allowed CORS origins          |
| `LOG_LEVEL`                     | `INFO`                     | Logging level                 |

---

## 📝 License

MIT
