# GoMint - Modern Cashback Platform

GoMint is a comprehensive cashback platform with separate interfaces for customers, businesses, and operators. The project includes static HTML pages with modern CSS and JavaScript, plus a Node.js backend with Express and MongoDB.

## Features

- **Customer Portal**: Register, login, create invoices, view cashback rewards
- **Business Portal**: Manage locations, offers, view customer cashback requests
- **Operator Portal**: Process cashback requests, manage invoices, update payment statuses
- **Modern UI**: Gradient designs, responsive layouts, smooth animations
- **API Backend**: RESTful endpoints with JWT authentication

## Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Create `.env` in project root:
   ```
   MONGO_URI=mongodb+srv://your-connection-string
   JWT_SECRET=your-secret-key
   PORT=3001
   SEED=true
   ```

3. **Seed Database** (optional):
   ```bash
   npm run seed
   ```

4. **Start Server**:
   ```bash
   npm start
   ```
   Server runs on http://localhost:3001

## Project Structure

- `gomint/` - Static HTML files and assets
- `routes/` - API route handlers
- `models/` - Mongoose schemas
- `middleware/` - Authentication middleware
- `server.js` - Main server file

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login and get JWT

### Resources
- `GET/POST/PUT/DELETE /api/customers`
- `GET/POST/PUT/DELETE /api/vendors`
- `GET/POST/PUT/DELETE /api/offers`
- `GET/POST/PUT/DELETE /api/invoices`
- `GET/POST/PUT/DELETE /api/locations`

### Protected Endpoints
Use `Authorization: Bearer <token>` header for authenticated requests.

## Development Notes

- Static files are served from `gomint/` directory
- CSS is inlined in HTML files for better performance
- Modern CSS with gradients, transitions, and responsive design
- JavaScript uses fetch API for client-server communication

## Deployment

For production, consider:
- Minifying CSS/JS
- Using a CDN for static assets
- Adding rate limiting and security headers
- Setting up proper logging and monitoring
