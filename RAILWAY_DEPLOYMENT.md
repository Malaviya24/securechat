# 🚀 SecureChat Railway Deployment Guide

## ✅ **Why Railway?**
- **Free tier** available
- **Better monorepo support**
- **Simple Node.js deployment**
- **Built-in PostgreSQL database**
- **Automatic GitHub integration**

---

## 📋 **Step-by-Step Deployment**

### **Phase 1: Railway Backend Setup**

#### 1. **Create Railway Account**
- [ ] Go to [railway.app](https://railway.app)
- [ ] Sign up with GitHub
- [ ] Verify your email

#### 2. **Create New Project**
- [ ] Click "New Project"
- [ ] Select "Deploy from GitHub repo"
- [ ] Connect your repository: `Malaviya24/securechat`
- [ ] Set **Root Directory**: `backend`
- [ ] Click "Deploy"

#### 3. **Configure Environment Variables**
Go to your project → "Variables" tab and add:

| **Name** | **Value** |
|----------|-----------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `JWT_SECRET` | `securechat-super-secret-jwt-key-2024` |
| `ENCRYPTION_KEY` | `securechat-encryption-key-2024` |

#### 4. **Add PostgreSQL Database**
- [ ] Go to "New" → "Database" → "PostgreSQL"
- [ ] Set **Name**: `securechat-db`
- [ ] **Plan**: Free
- [ ] Copy the **Database URL**
- [ ] Add to environment variables:
  | **Name** | **Value** |
  |----------|-----------|
  | `DATABASE_URL` | `[Your Railway PostgreSQL URL]` |

#### 5. **Deploy**
- [ ] Railway will automatically deploy
- [ ] Wait for deployment (2-3 minutes)
- [ ] Copy your backend URL: `https://securechat-backend.railway.app`

---

### **Phase 2: Vercel Frontend Setup**

#### 1. **Deploy to Vercel**
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] Import repository: `Malaviya24/securechat`
- [ ] Set **Root Directory**: `frontend`
- [ ] Add environment variable:
  | **Name** | **Value** |
  |----------|-----------|
  | `VITE_API_URL` | `https://securechat-backend.railway.app` |
- [ ] Click "Deploy"

#### 2. **Get Frontend URL**
- [ ] Copy your Vercel URL: `https://securechat.vercel.app`

---

### **Phase 3: Testing**

#### 1. **Test Your Deployment**
- [ ] Visit your Vercel frontend URL
- [ ] Create a chat room
- [ ] Test sending messages
- [ ] Verify encryption works
- [ ] Test QR code sharing

#### 2. **Update Repository**
- [ ] Update README.md with live URLs
- [ ] Add deployment badges
- [ ] Commit and push changes

---

## 🎉 **Success Checklist**

Your deployment is successful when:

✅ **Frontend loads** without errors  
✅ **Backend API** responds to requests  
✅ **Database connection** established  
✅ **Chat functionality** works  
✅ **Encryption** working properly  
✅ **Real-time features** functioning  
✅ **QR code sharing** works  

---

## 📞 **Need Help?**

If you encounter issues:

1. **Check Railway logs** - Go to your project → "Deployments" tab
2. **Check Vercel logs** - Go to your project → "Functions" tab
3. **Verify environment variables** - Make sure all variables are set
4. **Test database connection** - Check if DATABASE_URL is correct

---

## 🚀 **Your URLs**

Once deployed, you'll have:

- **Frontend**: `https://securechat.vercel.app`
- **Backend**: `https://securechat-backend.railway.app`
- **Repository**: `https://github.com/Malaviya24/securechat`

---

## 💰 **Cost**

- **Railway**: Free tier (500 hours/month)
- **Vercel**: Free tier (unlimited)
- **Total**: $0/month for personal use

---

## 📋 **Exact Configuration Summary**

### **Railway Backend Service:**
- **Root Directory**: `backend`
- **Start Command**: `npm start`
- **Plan**: Free

### **Environment Variables:**
| **Name** | **Value** |
|----------|-----------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `JWT_SECRET` | `securechat-super-secret-jwt-key-2024` |
| `ENCRYPTION_KEY` | `securechat-encryption-key-2024` |
| `DATABASE_URL` | `[Your Railway PostgreSQL URL]` |

### **Vercel Frontend:**
- **Root Directory**: `frontend`
- **Environment Variable**: `VITE_API_URL` = `https://securechat-backend.railway.app`

---

**Ready to start? Let me know when you've completed each step!** 🎯
