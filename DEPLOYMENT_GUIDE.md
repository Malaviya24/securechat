# 🚀 Complete Deployment Guide for SecureChat

This guide will help you deploy both frontend and backend of your SecureChat application.

## 📋 Prerequisites

- GitHub account
- Vercel account (for frontend)
- Railway account (for backend and database) - OR - Render account
- Node.js installed locally

## 🎯 Deployment Options

### Option 1: **Railway (Recommended - All-in-One)**
- **Frontend**: Vercel
- **Backend**: Railway
- **Database**: Railway PostgreSQL

### Option 2: **Render (Alternative)**
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: Render PostgreSQL

### Option 3: **Encore.ts Cloud**
- **Everything**: Encore.ts handles all

---

## 🚀 Option 1: Railway Deployment (Recommended)

### Step 1: Deploy Backend to Railway

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Select "Deploy from GitHub repo"**
5. **Choose your repository**: `Malaviya24/securechat`
6. **Set Root Directory**: `backend`
7. **Click "Deploy"**

### Step 2: Add Environment Variables to Railway

In your Railway project dashboard:

1. **Go to "Variables" tab**
2. **Add these environment variables:**

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:password@localhost:5432/securechat
JWT_SECRET=your-super-secret-jwt-key-here
ENCRYPTION_KEY=your-encryption-key-here
```

### Step 3: Add PostgreSQL Database

1. **In Railway dashboard, click "New"**
2. **Select "Database" → "PostgreSQL"**
3. **Wait for database to be created**
4. **Copy the DATABASE_URL from the database**
5. **Update the DATABASE_URL in your environment variables**

### Step 4: Deploy Frontend to Vercel

1. **Go to [Vercel.com](https://vercel.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Import your repository**: `Malaviya24/securechat`
5. **Set Root Directory**: `frontend`
6. **Add Environment Variables:**

```bash
VITE_API_URL=https://your-railway-backend-url.railway.app
```

7. **Click "Deploy"**

---

## 🚀 Option 2: Render Deployment

### Step 1: Deploy Backend to Render

1. **Go to [Render.com](https://render.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure:**
   - **Name**: `securechat-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### Step 2: Add Environment Variables to Render

In your Render service dashboard:

1. **Go to "Environment" tab**
2. **Add these variables:**

```bash
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-here
ENCRYPTION_KEY=your-encryption-key-here
```

### Step 3: Add PostgreSQL Database on Render

1. **In Render dashboard, click "New +"**
2. **Select "PostgreSQL"**
3. **Configure:**
   - **Name**: `securechat-db`
   - **Database**: `securechat`
   - **User**: `securechat_user`
4. **Copy the DATABASE_URL**
5. **Add DATABASE_URL to your backend environment variables**

### Step 4: Deploy Frontend to Vercel

Same as Option 1, but use your Render backend URL:

```bash
VITE_API_URL=https://your-render-backend-url.onrender.com
```

---

## 🚀 Option 3: Encore.ts Cloud (Simplest)

### Step 1: Install Encore CLI

```bash
npm install -g encore
```

### Step 2: Login to Encore

```bash
encore auth login
```

### Step 3: Deploy Everything

```bash
encore deploy
```

### Step 4: Get Your App URL

```bash
encore app list
```

---

## 🔧 Environment Variables Setup

### Backend Environment Variables

```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Security
JWT_SECRET=your-super-secret-jwt-key-here
ENCRYPTION_KEY=your-encryption-key-here

# App Configuration
NODE_ENV=production
PORT=3000

# Optional
LOG_LEVEL=info
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
CLEANUP_INTERVAL=3600000
```

### Frontend Environment Variables

```bash
# API URL (replace with your backend URL)
VITE_API_URL=https://your-backend-url.com
```

---

## 🗄️ Database Setup

### PostgreSQL Connection String Format

```
postgresql://username:password@host:port/database
```

### Example for Railway:
```
postgresql://postgres:password@containers-us-west-1.railway.app:5432/railway
```

### Example for Render:
```
postgresql://securechat_user:password@dpg-abc123-a.oregon-postgres.render.com:5432/securechat
```

---

## 🔧 Local Development Setup

### Step 1: Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### Step 2: Set Up Local Database

1. **Install PostgreSQL locally**
2. **Create database:**
```sql
CREATE DATABASE securechat;
CREATE USER securechat_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE securechat TO securechat_user;
```

### Step 3: Environment Variables

Create `.env` files:

**Backend (.env):**
```bash
DATABASE_URL=postgresql://securechat_user:your_password@localhost:5432/securechat
JWT_SECRET=your-local-jwt-secret
ENCRYPTION_KEY=your-local-encryption-key
NODE_ENV=development
PORT=3000
```

**Frontend (.env.local):**
```bash
VITE_API_URL=http://localhost:3000
```

### Step 4: Run Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DATABASE_URL format
   - Verify database credentials
   - Ensure database is running

2. **CORS Errors**
   - Add frontend URL to backend CORS settings
   - Check VITE_API_URL in frontend

3. **Build Failures**
   - Check Node.js version (use v18+)
   - Verify all dependencies are installed
   - Check for TypeScript errors

4. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names (case-sensitive)
   - Restart deployment after adding variables

### Debugging Commands

```bash
# Check backend logs
railway logs

# Check frontend build
vercel logs

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Check environment variables
echo $DATABASE_URL
```

---

## 📊 Monitoring Your Deployment

### Railway Dashboard
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory usage
- **Deployments**: Build and deployment status

### Vercel Dashboard
- **Analytics**: Page views, performance
- **Functions**: Serverless function logs
- **Domains**: Custom domain management

### Database Monitoring
- **Connection Pool**: Active connections
- **Query Performance**: Slow query analysis
- **Storage**: Database size and growth

---

## 🔒 Security Checklist

- [ ] **HTTPS enabled** on all domains
- [ ] **Environment variables** properly set
- [ ] **Database credentials** secured
- [ ] **CORS settings** configured
- [ ] **Rate limiting** enabled
- [ ] **Input validation** working
- [ ] **SSL certificates** valid
- [ ] **Backup strategy** implemented

---

## 🎉 Success Indicators

Your deployment is successful when:

1. **Frontend loads** without errors
2. **Backend API** responds to requests
3. **Database connection** established
4. **Chat functionality** works
5. **Encryption** working properly
6. **Real-time features** functioning

---

## 📞 Support

### Railway Support
- [Railway Documentation](https://docs.railway.app/)
- [Railway Discord](https://discord.gg/railway)

### Vercel Support
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### Render Support
- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)

---

**Remember:** Always test your deployment in a staging environment before going to production!
