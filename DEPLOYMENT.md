# 🚀 SecureChat Deployment Guide

This guide covers deploying SecureChat to various platforms.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **Git** 
- **Encore CLI** (for cloud deployment)
- **PostgreSQL** (for self-hosted)

## ☁️ Encore.ts Cloud Deployment (Recommended)

### 1. Install Encore CLI
```bash
npm install -g @encore/cli
```

### 2. Login to Encore
```bash
encore auth login
```

### 3. Deploy to Cloud
```bash
encore deploy
```

### 4. Get Your App URL
```bash
encore app list
```

## 🏠 Self-Hosted Deployment

### Option 1: Docker Deployment

1. **Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

2. **Create docker-compose.yml**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/securechat
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=securechat
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

3. **Deploy with Docker**
```bash
docker-compose up -d
```

### Option 2: Manual Deployment

1. **Install Dependencies**
```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

2. **Build Application**
```bash
cd frontend && npm run build
cd ../backend && npm run build
```

3. **Set Environment Variables**
```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/securechat"
export NODE_ENV="production"
```

4. **Start Application**
```bash
npm start
```

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/securechat

# Security
JWT_SECRET=your-super-secret-jwt-key
ENCRYPTION_KEY=your-encryption-key

# App Configuration
NODE_ENV=production
PORT=3000
```

### Optional Environment Variables

```bash
# Logging
LOG_LEVEL=info

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100

# Cleanup
CLEANUP_INTERVAL=3600000
```

## 🗄️ Database Setup

### PostgreSQL Installation

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql
```

**Windows:**
Download from [PostgreSQL official website](https://www.postgresql.org/download/windows/)

### Database Creation

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE securechat;
CREATE USER securechat_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE securechat TO securechat_user;
\q
```

## 🔒 SSL/HTTPS Setup

### Using Let's Encrypt (Recommended)

1. **Install Certbot**
```bash
sudo apt install certbot
```

2. **Get SSL Certificate**
```bash
sudo certbot certonly --standalone -d yourdomain.com
```

3. **Configure Nginx**
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring & Logging

### Application Monitoring

1. **Health Check Endpoint**
```bash
curl https://yourdomain.com/health
```

2. **Log Monitoring**
```bash
# View application logs
tail -f /var/log/securechat/app.log

# View error logs
tail -f /var/log/securechat/error.log
```

### Database Monitoring

```bash
# Check database connections
psql -d securechat -c "SELECT count(*) FROM pg_stat_activity;"

# Check table sizes
psql -d securechat -c "SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

## 🔄 Backup Strategy

### Database Backup

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/var/backups/securechat"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/securechat_$DATE.sql"

mkdir -p $BACKUP_DIR
pg_dump securechat > $BACKUP_FILE
gzip $BACKUP_FILE

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab (daily backup at 2 AM)
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

### Application Backup

```bash
# Backup application files
tar -czf /var/backups/securechat/app_$(date +%Y%m%d_%H%M%S).tar.gz /path/to/securechat
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U securechat_user -d securechat
```

2. **Port Already in Use**
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

3. **SSL Certificate Issues**
```bash
# Test SSL certificate
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com

# Renew certificate
sudo certbot renew
```

### Performance Optimization

1. **Database Optimization**
```sql
-- Create indexes for better performance
CREATE INDEX CONCURRENTLY idx_messages_room_created ON messages(room_id, created_at);
CREATE INDEX CONCURRENTLY idx_typing_room_timestamp ON typing_indicators(room_id, timestamp);
```

2. **Application Optimization**
```bash
# Enable gzip compression
npm install compression

# Use PM2 for process management
npm install -g pm2
pm2 start app.js --name securechat
```

## 📈 Scaling

### Horizontal Scaling

1. **Load Balancer Setup**
```nginx
upstream securechat_backend {
    server 127.0.0.1:3000;
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;
    location / {
        proxy_pass http://securechat_backend;
    }
}
```

2. **Database Replication**
```sql
-- On master
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET max_wal_senders = 3;
ALTER SYSTEM SET max_replication_slots = 3;

-- On replica
pg_basebackup -h master_host -D /var/lib/postgresql/data -U replicator -v -P -W
```

## 🔐 Security Checklist

- [ ] SSL/HTTPS enabled
- [ ] Firewall configured
- [ ] Database access restricted
- [ ] Regular security updates
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting setup
- [ ] Rate limiting configured
- [ ] Input validation enabled
- [ ] SQL injection protection
- [ ] XSS protection enabled

## 📞 Support

For deployment issues:
- Check application logs
- Verify environment variables
- Test database connectivity
- Review firewall settings
- Contact support team

---

**Remember:** Always test your deployment in a staging environment before going to production!
