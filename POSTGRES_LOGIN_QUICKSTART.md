# PostgreSQL Login - Quick Start

## ⚡ 5-Minute Setup

### 1. Verify PostgreSQL Installation
```powershell
# Check if PostgreSQL is installed
psql --version

# Start PostgreSQL service (if not running)
Get-Service postgresql* | Start-Service
```

### 2. Update .env File
Edit `.env` and set your PostgreSQL password:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gomint_db
DB_USER=postgres
DB_PASSWORD=your_actual_postgres_password  # ← Change this!
JWT_SECRET=YourSuperSecretKey123!
NODE_ENV=development
PORT=3001
```

### 3. Create Database
```powershell
# Connect to PostgreSQL
psql -U postgres

# In psql prompt:
CREATE DATABASE gomint_db;
\q  # Exit psql
```

### 4. Initialize Database Tables
```powershell
npm run db:init
```
Expected output:
```
Testing database connection...
✓ Database connection successful
Syncing models with database...
✓ Database synchronized
✓ Database initialization complete!
```

### 5. Start Server
```powershell
npm start
```

Server is ready! 🚀

---

## 🧪 Test Login Flow

### Register a User
```powershell
$registerData = @{
    username = "test@example.com"
    password = "Password123!"
    role = "customer"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/register" `
  -Method POST `
  -ContentType "application/json" `
  -Body $registerData
```

### Login
```powershell
$loginData = @{
    username = "test@example.com"
    password = "Password123!"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $loginData

# Save token
$token = $response.token
Write-Output "Token: $token"
```

### Use Token to Access Protected Route
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3001/api/auth/me" `
  -Method GET `
  -Headers $headers
```

---

## 📋 Implementation Summary

| Component | Status | File |
|-----------|--------|------|
| PostgreSQL Connection | ✅ Done | `config/database.js` |
| User Model | ✅ Done | `models/userPostgres.js` |
| Register Endpoint | ✅ Done | `routes/authPostgres.js` |
| Login Endpoint | ✅ Done | `routes/authPostgres.js` |
| Get User Endpoint | ✅ Done | `routes/authPostgres.js` |
| JWT Authentication | ✅ Done | `routes/authPostgres.js` |
| Password Hashing | ✅ Done | bcryptjs |
| Server Integration | ✅ Done | `server.js` |
| DB Initialization | ✅ Done | `scripts/initDb.js` |

---

## ⚠️ Common Issues

### "Could not connect to database"
```powershell
# Check PostgreSQL is running
Get-Service postgresql* | Select-Object Status

# Verify credentials in .env
# Default: user=postgres, password=postgres
```

### "Database gomint_db does not exist"
```powershell
psql -U postgres -c "CREATE DATABASE gomint_db;"
npm run db:init
```

### "Invalid or expired token"
The token expires after 7 days. User must login again.

### Port 3000 already in use
Change PORT in `.env` and restart.

---

## 🔑 Key Features

✅ **Secure Password Storage** - bcryptjs hashing  
✅ **JWT Authentication** - 7-day expiration  
✅ **Role-Based Access** - operator, vendor, customer, admin  
✅ **Error Handling** - Comprehensive error messages  
✅ **Database Persistence** - PostgreSQL with Sequelize ORM  
✅ **Protected Routes** - `/api/auth/me` requires token  

---

## 📊 User Table Schema

```sql
users:
  - id (UUID) - Primary Key
  - username (VARCHAR) - Unique email
  - passwordHash (VARCHAR) - Hashed password
  - role (ENUM) - operator|vendor|customer|admin
  - createdAt (TIMESTAMP)
  - updatedAt (TIMESTAMP)
```

---

**Ready to Go!** Your PostgreSQL login is fully configured. 🎉
