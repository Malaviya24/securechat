# 🚀 SecureChat Deployment Checklist

## ✅ Step-by-Step Deployment Guide

### **Phase 1: Railway Backend Deployment**

#### 1. Railway Setup
- [ ] Go to [Railway.app](https://railway.app)
- [ ] Sign up/Login with GitHub
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Choose repository: `Malaviya24/securechat`
- [ ] Set Root Directory: `backend`
- [ ] Click "Deploy"

#### 2. Add PostgreSQL Database
- [ ] In Railway dashboard, click "New"
- [ ] Select "Database" → "PostgreSQL"
- [ ] Wait for database creation
- [ ] Copy the DATABASE_URL

#### 3. Environment Variables
- [ ] Go to backend service → "Variables" tab
- [ ] Add these variables:

```bash
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://postgres:password@your-railway-db-url:5432/railway
JWT_SECRET=securechat-super-secret-jwt-key-2024
ENCRYPTION_KEY=securechat-encryption-key-2024
```

#### 4. Get Backend URL
- [ ] Copy your Railway backend URL
- [ ] It will look like: `https://your-app.railway.app`

---

### **Phase 2: Vercel Frontend Deployment**

#### 1. Vercel Setup
- [ ] Go to [Vercel.com](https://vercel.com)
- [ ] Sign up/Login with GitHub
- [ ] Click "New Project"
- [ ] Import repository: `Malaviya24/securechat`
- [ ] Set Root Directory: `frontend`

#### 2. Environment Variables
- [ ] Add Environment Variable:
```bash
VITE_API_URL=https://your-railway-backend-url.railway.app
```
- [ ] Replace with your actual Railway backend URL
- [ ] Click "Deploy"

#### 3. Get Frontend URL
- [ ] Copy your Vercel frontend URL
- [ ] It will look like: `https://your-app.vercel.app`

---

### **Phase 3: Testing**

#### 1. Test Your Deployment
- [ ] Visit your Vercel frontend URL
- [ ] Try creating a chat room
- [ ] Test sending messages
- [ ] Verify encryption works
- [ ] Test QR code sharing

#### 2. Update Repository Links
- [ ] Update README.md with your live URLs
- [ ] Add deployment badges
- [ ] Commit and push changes

---

## 🎉 Success Checklist

Your deployment is successful when:

✅ **Frontend loads** without errors  
✅ **Backend API** responds to requests  
✅ **Database connection** established  
✅ **Chat functionality** works  
✅ **Encryption** working properly  
✅ **Real-time features** functioning  
✅ **QR code sharing** works  

---

## 📞 Need Help?

If you encounter any issues:

1. **Check Railway logs** - Go to your backend service → "Logs" tab
2. **Check Vercel logs** - Go to your frontend project → "Functions" tab
3. **Verify environment variables** - Make sure all variables are set correctly
4. **Test database connection** - Check if DATABASE_URL is correct

---

## 🚀 Your URLs

Once deployed, you'll have:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **Repository**: `https://github.com/Malaviya24/securechat`

---

**Ready to start? Let me know when you've completed each step!** 🎯
