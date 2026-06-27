# Raikos Backend - Modular MVC & MySQL Data Store

Welcome to the refactored, modular backend of the **Raikos** room-rental website. The codebase has been transitioned from a monolithic file to a clean Model-View-Controller (MVC) architecture, and the database has been migrated from a local JSON file (`db.json`) to a relational MySQL database using raw SQL prepared statements and connection pooling.

---

## Technical Stack
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express.js
- **Database Driver:** `mysql2/promise` (Promise-based connection pool)
- **Dev Server Middleware:** Vite (for serving the React frontend in development)

---

## Directory Structure
The backend is structured modularly as follows:

```text
backend/
├── src/
│   ├── server.js               # Application entry point (listens on PORT)
│   ├── app.js                  # Express application setup & middleware routing
│   ├── config/
│   │   └── database.js         # MySQL2 connection pool setup
│   ├── routes/                 # Endpoint definitions (no business logic)
│   │   ├── auth.routes.js
│   │   ├── room.routes.js
│   │   ├── tenant.routes.js
│   │   ├── booking.routes.js
│   │   ├── payment.routes.js
│   │   ├── notification.routes.js
│   │   ├── report.routes.js
│   │   ├── erd.routes.js
│   │   └── db.routes.js
│   ├── controllers/            # Request/Response mapping & status codes
│   │   ├── auth.controller.js
│   │   ├── room.controller.js
│   │   ├── tenant.controller.js
│   │   ├── booking.controller.js
│   │   ├── payment.controller.js
│   │   ├── notification.controller.js
│   │   ├── report.controller.js
│   │   ├── erd.controller.js
│   │   └── db.controller.js
│   ├── services/               # Core business logic & MySQL queries
│   │   ├── auth.service.js
│   │   ├── room.service.js
│   │   ├── tenant.service.js
│   │   ├── booking.service.js
│   │   ├── payment.service.js
│   │   ├── notification.service.js
│   │   ├── report.service.js
│   │   ├── erd.service.js
│   │   └── db.service.js
│   ├── database/               # SQL files & Migration scripts
│   │   ├── schema.sql          # DDL tables schema
│   │   ├── seed.sql            # Initial DML records seeding
│   │   └── migrate.js          # Automated database setup & JSON-to-MySQL migrator
│   ├── middleware/             # Express middlewares
│   │   └── index.js
│   └── utils/                  # Shared utilities & normalization helpers
│       ├── generateId.js
│       └── helpers.js
├── .env.example                # Template for environment variables
├── .env                        # Active environment configurations
├── package.json                # Dependencies & script configs
└── README.md                   # This documentation file
```

---

## Environment Variables
Create a `.env` file inside the `backend/` directory (or use the one created during migration) with the following variables:

```env
PORT=3000
NODE_ENV=development

# Database Configurations
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=raikos_db
DB_CONNECTION_LIMIT=10
```

---

## Getting Started

### 1. Install Dependencies
Navigate to the `backend` folder and install the node modules:
```bash
cd backend
npm install
```

### 2. Database Migration (Setup MySQL & Import Existing Data)
We have provided an automated migration script that connects to your MySQL server, creates the `raikos_db` database, sets up all relational tables, and **migrates your existing development records** from the root `db.json` (if present) into MySQL.

Ensure your MySQL server is running and your credentials in `backend/.env` are correct, then run:
```bash
node src/database/migrate.js
```
*Note: If no `db.json` is found in the root, the script will automatically seed the database with the default dataset from `seed.sql`.*

### 3. Run the Project
The backend is set up to run Vite as a development middleware, meaning you only need to start the backend to run both the API and the React frontend on `http://localhost:3000`:

From the **project root**:
```bash
npm run dev
```

Or from the **`backend` folder**:
```bash
npm run dev
```

---

## Key MVC Design Patterns Implemented

1. **Transactional Integrity:** Operations that modify multiple tables (e.g. creating a booking updates the room status to "dipesan" and writes a user notification) are wrapped in **SQL Transactions** (`conn.beginTransaction()`). If any query fails, the entire block rolls back.
2. **Security & Validation:** All MySQL queries use **Prepared Statements** (using `?` placeholders) to protect the application from SQL injection vulnerabilities.
3. **Data Mapping & Normalization:** MySQL stores booleans as `TINYINT` (0 or 1) and decimals as strings. Our services automatically cast these into proper TypeScript-friendly booleans and numbers, ensuring perfect compatibility with the React frontend types without needing client-side changes.
4. **Decoupled Business Logic:** The routes files contain only endpoint definitions. The controllers parse requests and serialize responses. The services contain all the business logic and query operations.
