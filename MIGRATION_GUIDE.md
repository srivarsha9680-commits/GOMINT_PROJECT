# MongoDB to PostgreSQL Migration Guide

## Overview
This guide explains how to migrate the login functionality from MongoDB to PostgreSQL in the GoMint application.

## New Files Created

### 1. **config/database.js** - PostgreSQL Connection
- Initializes Sequelize ORM for PostgreSQL
- Configurable via environment variables
- Connection pooling for performance

### 2. **models/userPostgres.js** - PostgreSQL User Model
- Replaces Mongoose User model
- Uses Sequelize DataTypes
- UUID primary key (instead of MongoDB ObjectId)
- ENUM for role validation
- Timestamps (createdAt, updatedAt)

### 3. **routes/authPostgres.js** - PostgreSQL Auth Routes
- Updated login endpoint for PostgreSQL
- Updated register endpoint
- New `/me` endpoint to get current user
- Logout endpoint
- JWT token generation and verification

### 4. **scripts/initDb.js** - Database Initialization
- Creates database tables
- Syncs models with database
- Run once before starting the application

## Installation & Setup

### Step 1: Install Dependencies
```bash
npm install pg sequelize
```

### Step 2: Configure Environment Variables
Create or update `.env` file:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gomint_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your-secret-key-here
NODE_ENV=development
```

### Step 3: Create PostgreSQL Database
```sql
CREATE DATABASE gomint_db;
```

### Step 4: Initialize Database Tables
```bash
node scripts/initDb.js
```

## Usage

### Option 1: Use PostgreSQL Auth (Recommended)
Update `server.js` to use the PostgreSQL auth routes:
```javascript
// Replace existing auth route
app.use('/api/auth', require('./routes/authPostgres'));
```

### Option 2: Keep Both (During Migration)
You can keep both MongoDB and PostgreSQL running:
```javascript
// MongoDB auth (existing)
app.use('/api/auth/mongo', require('./routes/auth'));

// PostgreSQL auth (new)
app.use('/api/auth', require('./routes/authPostgres'));
```

## API Endpoints

### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "securepassword",
  "role": "customer",
  "firstName": "John",
  "lastName": "Doe",
  "mobile": "+1234567890"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "user@example.com",
  "password": "securepassword"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "user@example.com",
    "role": "customer"
  }
}
```

### Get Current User (Protected)
```bash
GET /api/auth/me
Authorization: Bearer <token>

Response:
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "username": "user@example.com",
  "role": "customer"
}
```

### Logout
```bash
POST /api/auth/logout
Authorization: Bearer <token>

Response:
{
  "message": "Logged out successfully"
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'operator' CHECK (role IN ('operator', 'vendor', 'customer', 'admin')),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Key Differences: MongoDB vs PostgreSQL

| Aspect | MongoDB | PostgreSQL |
|--------|---------|------------|
| ID Type | ObjectId | UUID |
| Query | `findOne({ username })` | `findOne({ where: { username } })` |
| Create | `User.create({...})` | `User.create({...})` |
| Update | `findByIdAndUpdate()` | `update()` + `save()` |
| Delete | `findByIdAndDelete()` | `destroy()` |
| Validation | Schema-level | ENUM constraints + app-level |
| Unique Constraints | Built-in | Database constraints |

## Migration Checklist

- [ ] Install PostgreSQL
- [ ] Update package.json with `pg` and `sequelize`
- [ ] Create `.env` file with PostgreSQL credentials
- [ ] Create `gomint_db` database
- [ ] Run `node scripts/initDb.js`
- [ ] Update `server.js` to use new auth routes
- [ ] Test login/register endpoints
- [ ] Migrate other models (Customer, Vendor, Invoice, etc.)
- [ ] Remove MongoDB routes and models
- [ ] Update frontend if needed

## Testing

### Using cURL
```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "password123",
    "role": "customer"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### Connection Error: "connect ECONNREFUSED 127.0.0.1:5432"
- Ensure PostgreSQL is running
- Check DB_HOST and DB_PORT in .env
- Verify database credentials

### Error: "relation \"users\" does not exist"
- Run `node scripts/initDb.js` to create tables
- Or run `sequelize db:migrate` if using migrations

### JWT Token Errors
- Ensure JWT_SECRET is set in .env
- Check token expiration (default: 7 days)

## Next Steps

1. Convert remaining models (Customer, Vendor, Invoice, Location, Offer)
2. Create Sequelize migrations for version control
3. Add database indexes for performance
4. Implement soft deletes for data retention
5. Set up database backups
