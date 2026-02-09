# PostgreSQL Login Migration - Quick Start

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Create .env file
Copy `.env.example` and configure with your PostgreSQL details:
```bash
cp .env.example .env
```

Edit `.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gomint_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### 3. Create PostgreSQL Database
```bash
createdb gomint_db
```

### 4. Initialize Database Tables
```bash
npm run db:init
```

### 5. Start the Server
```bash
npm start
```

Server runs on `http://localhost:3001`

## Test Login

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password123",
    "role": "customer"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "user@example.com",
    "password": "password123"
  }'
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "user@example.com",
    "role": "customer"
  }
}
```

### Use Token to Get Current User
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED 127.0.0.1:5432` | PostgreSQL not running. Start PostgreSQL service. |
| `database "gomint_db" does not exist` | Run `createdb gomint_db` |
| `relation "users" does not exist` | Run `npm run db:init` |
| `Invalid token` | Token may be expired or invalid. Login again. |

## File Structure

```
gomint_project/
├── config/
│   └── database.js           # PostgreSQL connection
├── models/
│   ├── userPostgres.js       # User model (PostgreSQL)
│   └── user.js               # User model (MongoDB - legacy)
├── routes/
│   ├── authPostgres.js       # Auth routes (PostgreSQL)
│   └── auth.js               # Auth routes (MongoDB - legacy)
├── scripts/
│   └── initDb.js             # Database initialization
├── server.js                 # Updated for PostgreSQL
├── .env                      # Configuration (create from .env.example)
└── package.json              # Updated with pg & sequelize
```

## What's Changed

- ✅ Login now uses PostgreSQL instead of MongoDB
- ✅ User model converted to Sequelize ORM
- ✅ Database tables created automatically on startup
- ✅ JWT authentication working with PostgreSQL
- ✅ MongoDB still supports other models during migration

## Next Steps

Once login is working, migrate other models:
1. Customer
2. Vendor  
3. Invoice
4. Location
5. Offer
6. CashbackRequest
7. BankDetails
