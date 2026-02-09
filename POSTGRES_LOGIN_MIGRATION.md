# PostgreSQL Login Migration - Complete Setup Guide

## Current Status ✅

The PostgreSQL login functionality has been **fully implemented** and is already active in your application! Here's what's been done:

### Files Already Modified:
- ✅ `routes/authPostgres.js` - Complete login/register implementation for PostgreSQL
- ✅ `models/userPostgres.js` - Sequelize User model for PostgreSQL
- ✅ `config/database.js` - PostgreSQL connection configuration
- ✅ `server.js` - Already using `routes/authPostgres` for authentication
- ✅ `scripts/initDb.js` - Database initialization script
- ✅ `package.json` - Has `pg` and `sequelize` dependencies installed

## PostgreSQL Login Endpoints

Your application now provides these authenticated endpoints:

### 1. **Register New User**
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "securePassword123",
  "role": "customer|vendor|operator|admin"
}

Response (201):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "user@example.com",
  "role": "customer"
}
```

### 2. **Login**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "securePassword123"
}

Response (200):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "user@example.com",
    "role": "customer"
  }
}
```

### 3. **Get Current User (Protected)**
```bash
GET /api/auth/me
Authorization: Bearer <JWT_TOKEN>

Response (200):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "user@example.com",
  "role": "customer"
}
```

### 4. **Logout**
```bash
POST /api/auth/logout

Response (200):
{
  "message": "Logged out successfully"
}
```

## Setup Instructions

### Step 1: Ensure PostgreSQL is Running
Make sure PostgreSQL is installed and running on your system.

```bash
# Windows (using psql)
psql -U postgres

# Or check if service is running
Get-Service postgresql*
```

### Step 2: Verify .env Configuration
Your `.env` file already has PostgreSQL settings:

```env
# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gomint_db
DB_USER=postgres
DB_PASSWORD=postgres
NODE_ENV=development

# JWT Configuration
JWT_SECRET=YourSuperSecretKey123!
PORT=3001
```

**⚠️ Important:** Update the `DB_PASSWORD` to match your PostgreSQL password!

### Step 3: Initialize Database
Run the initialization script to create tables:

```bash
npm run db:init
```

You should see:
```
Testing database connection...
✓ Database connection successful
Syncing models with database...
✓ Database synchronized
✓ Database initialization complete!
```

### Step 4: Start Server
```bash
npm start
```

Expected output:
```
Server listening on port 3000
```

## Database Schema

The PostgreSQL `users` table has this structure:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR UNIQUE NOT NULL,
  passwordHash VARCHAR NOT NULL,
  role ENUM('operator', 'vendor', 'customer', 'admin') DEFAULT 'operator',
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Migration Checklist

- [x] PostgreSQL connection configured
- [x] User model created (Sequelize)
- [x] Auth routes fully implemented
- [x] Server.js updated to use PostgreSQL auth
- [x] Password hashing with bcryptjs
- [x] JWT token generation and verification
- [x] Database initialization script ready
- [ ] **Environment variables configured** (⚠️ Pending)
- [ ] **Database initialized** (⚠️ Pending)
- [ ] **Server started and tested** (⚠️ Pending)

## Testing the Login Flow

### Test Registration:
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test123@example.com",
    "password": "TestPassword123!",
    "role": "customer"
  }'
```

### Test Login:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test123@example.com",
    "password": "TestPassword123!"
  }'
```

Save the token from the response, then test protected endpoint:

```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Key Implementation Details

### Password Security
- Passwords are hashed using `bcryptjs` with 10 salt rounds
- Never stored in plain text
- Compared safely during login

### JWT Token
- Generated with user ID and role
- Expires in 7 days
- Used in `Authorization: Bearer <token>` header

### Error Handling
- Invalid credentials return 401 Unauthorized
- Missing fields return 400 Bad Request
- Server errors return 500 Internal Server Error
- All errors include descriptive messages

## Switching Database Strategy

### Current Setup (PostgreSQL Only)
```javascript
app.use('/api/auth', require('./routes/authPostgres')); // PostgreSQL
```

### Dual Support (if needed for testing)
If you want to keep MongoDB running in parallel:
```javascript
app.use('/api/auth', require('./routes/authPostgres'));  // PostgreSQL (primary)
app.use('/api/auth/mongo', require('./routes/auth'));    // MongoDB (fallback)
```

## Removing MongoDB Dependency (Optional)

Once fully migrated, you can remove MongoDB:

```bash
npm uninstall mongoose
```

And remove from `server.js`:
```javascript
// Remove these lines:
// const mongoose = require('mongoose');
// const Vendor = require('./models/vendor');
// const Offer = require('./models/offer');
// const Customer = require('./models/customer');
// const Invoice = require('./models/invoice');
// const Location = require('./models/location.js');
```

## Troubleshooting

### Database Connection Failed
- Check PostgreSQL is running
- Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD in .env
- Ensure database `gomint_db` exists:
  ```bash
  createdb gomint_db
  ```

### "Email already registered" on Login
- User already exists in database
- Check with:
  ```bash
  psql -U postgres -d gomint_db -c "SELECT * FROM users;"
  ```

### JWT Token Expired
- Token expires in 7 days
- User must login again to get new token
- Change expiration in `authPostgres.js` line 10:
  ```javascript
  { expiresIn: '30d' } // Change duration here
  ```

### Database Sync Issues
Reset database (⚠️ deletes all data):
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS gomint_db; CREATE DATABASE gomint_db;"
npm run db:init
```

## Next Steps for Full Migration

After login migration is complete, migrate other modules:

1. **Customer Routes** - Update `/api/customers` to use PostgreSQL
2. **Vendor Routes** - Update `/api/vendors` to use PostgreSQL
3. **Invoice Routes** - Update `/api/invoices` to use PostgreSQL
4. **Offer Routes** - Update `/api/offers` to use PostgreSQL
5. **Location Routes** - Update `/api/locations` to use PostgreSQL
6. **Cashback Routes** - Update cashback requests to use PostgreSQL

Each module follows the same pattern:
- Create PostgreSQL model in `models/`
- Create routes in `routes/`
- Update `server.js` to use new routes

## Support & Questions

For more details on:
- Sequelize ORM: https://sequelize.org/
- PostgreSQL: https://www.postgresql.org/docs/
- JWT: https://jwt.io/
- bcryptjs: https://www.npmjs.com/package/bcryptjs

---
**Migration Date:** 2026-02-09
**Status:** ✅ Login Functionality Ready
**Last Updated:** 2026-02-09
