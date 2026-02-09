# PostgreSQL Login Implementation - Key Files

## Quick Reference

### Files Modified/Created:
1. ✅ `config/database.js` - PostgreSQL connection
2. ✅ `models/userPostgres.js` - User model (Sequelize)
3. ✅ `routes/authPostgres.js` - Auth routes (PostgreSQL)
4. ✅ `scripts/initDb.js` - Database initialization
5. ✅ `package.json` - Added pg & sequelize dependencies
6. ✅ `.env.example` - Example environment variables

## Code Comparison: Login Endpoint

### MongoDB (Original)
```javascript
// routes/auth.js
router.post('/login', async (req, res) => {
  const user = await User.findOne({ username }); // Mongoose query
  const ok = await bcrypt.compare(password, user.passwordHash);
  const token = generateToken(user);
  res.json({ token });
});
```

### PostgreSQL (New)
```javascript
// routes/authPostgres.js
router.post('/login', async (req, res) => {
  const user = await User.findOne({ where: { username } }); // Sequelize query
  const ok = await bcrypt.compare(password, user.passwordHash);
  const token = generateToken(user);
  res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
});
```

## How to Enable PostgreSQL Login

### Method 1: Direct Replacement (server.js)
```javascript
// OLD: app.use('/api/auth', require('./routes/auth'));
// NEW:
app.use('/api/auth', require('./routes/authPostgres'));
```

### Method 2: Dual Support (for testing)
```javascript
app.use('/api/auth', require('./routes/authPostgres'));     // PostgreSQL (primary)
app.use('/api/auth/mongo', require('./routes/auth'));       // MongoDB (fallback)
```

## Setup Commands

```bash
# 1. Install dependencies
npm install pg sequelize

# 2. Create .env file (use .env.example as template)
cp .env.example .env

# 3. Create PostgreSQL database
createdb gomint_db

# 4. Initialize database tables
node scripts/initDb.js

# 5. Start server
npm start
```

## Testing the Login Flow

```bash
# Register a new user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"test123","role":"customer"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test@example.com","password":"test123"}'

# Use the token to access protected routes
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Database Structure

The PostgreSQL `users` table has this structure:
- `id` (UUID, PRIMARY KEY)
- `username` (VARCHAR, UNIQUE, NOT NULL)
- `passwordHash` (VARCHAR, NOT NULL)
- `role` (ENUM: operator, vendor, customer, admin)
- `createdAt` (TIMESTAMP)
- `updatedAt` (TIMESTAMP)

## Next Phase: Full Migration

To complete the migration, convert these models:
1. Customer model
2. Vendor model
3. Invoice model
4. Location model
5. Offer model
6. CashbackRequest model
7. BankDetails model

Each follows the same pattern:
- Define in `models/modelNamePostgres.js` using Sequelize
- Create routes in `routes/modelName.js`
- Establish relationships between models
