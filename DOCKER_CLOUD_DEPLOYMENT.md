# 🐳 Docker Deployment Guide (MongoDB Cloud)

## 📋 Prerequisites

- Docker & Docker Compose installed
- MongoDB Atlas account (Cloud Database)
- Webhook endpoint accessible

---

## 🚀 Quick Start

### 1. **Setup MongoDB Atlas**

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string (looks like `mongodb+srv://...`)
   - Replace `<password>` with your database password

**Example:**
```
mongodb+srv://username:password@cluster1.xxxxx.mongodb.net/cursor?retryWrites=true&w=majority
```

### 2. **Setup Environment Variables**

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your values:
```env
# Your MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.xxxxx.mongodb.net/cursor?retryWrites=true&w=majority

# Generate random JWT secret (32+ characters)
JWT_SECRET=your-super-secret-jwt-key-32-chars-minimum

# Your webhook base URL
WEBHOOK_BASE_URL=https://n8n.thietkelx.com/webhook

# Production environment
NODE_ENV=production
```

**Generate secure JWT secret:**
```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

### 3. **Build & Run**

```bash
# Build and start
docker-compose up -d --build

# Check logs
docker-compose logs -f app

# Check status
docker-compose ps
```

### 4. **Verify Deployment**

```bash
# Check API health
curl http://localhost:3000/api/auth/me

# Expected response: 401 (Unauthorized) or 200 (if logged in)
```

### 5. **Create Admin User**

```bash
# Shell into container
docker-compose exec app sh

# Run create-admin script
node scripts/create-admin.js

# Exit container
exit
```

---

## 🏗️ Architecture (Simplified)

```
┌────────────────────────────────────────────┐
│        Docker Container (Your Server)      │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │   Next.js App (Port 3000)            │ │
│  │   - API Routes                       │ │
│  │   - Playwright Automation            │ │
│  │   - Chromium Browser                 │ │
│  └──────────────┬───────────────────────┘ │
│                 │                          │
└─────────────────┼──────────────────────────┘
                  │
                  │ Internet
                  │
        ┌─────────▼─────────┐
        │  MongoDB Atlas    │
        │  (Cloud Database) │
        └───────────────────┘
```

**Benefits:**
- ✅ No MongoDB container (simpler setup)
- ✅ Managed backups (automatic by Atlas)
- ✅ Scalable (Atlas handles scaling)
- ✅ Secure (Atlas built-in security)
- ✅ Smaller Docker image

---

## 📝 Docker Commands

### Start/Stop
```bash
# Start
docker-compose up -d

# Stop
docker-compose down

# Restart
docker-compose restart
```

### Logs & Debugging
```bash
# View logs
docker-compose logs -f app

# Last 100 lines
docker-compose logs --tail=100 app

# Shell into container
docker-compose exec app sh
```

### Rebuild (after code changes)
```bash
# Quick rebuild
docker-compose up -d --build

# Clean rebuild (no cache)
docker-compose build --no-cache
docker-compose up -d
```

### Cleanup
```bash
# Remove container
docker-compose down

# Remove container + images
docker-compose down --rmi all

# Clean all Docker resources
docker system prune -a
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | JWT signing secret (32+ chars) | `your-random-secret-key-here` |
| `WEBHOOK_BASE_URL` | Webhook base URL | `https://n8n.thietkelx.com/webhook` |
| `NODE_ENV` | Environment | `production` |

### Ports

| Port | Service | Description |
|------|---------|-------------|
| 3000 | Next.js App | Main application |

---

## 🔐 MongoDB Atlas Security

### 1. **Whitelist IP Addresses**
In MongoDB Atlas dashboard:
- Go to "Network Access"
- Add IP address of your Docker host
- Or use `0.0.0.0/0` (allow all - less secure)

### 2. **Database User**
- Create dedicated user for your app
- Use strong password
- Grant only necessary permissions (readWrite on specific database)

### 3. **Connection String Security**
- ⚠️ Never commit `.env` to Git (already in `.gitignore`)
- Use environment variables in CI/CD
- Rotate passwords regularly

---

## 🚀 Production Deployment

### Option A: VPS/Server

1. **Install Docker:**
   ```bash
   # Ubuntu/Debian
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   
   # Install Docker Compose
   apt-get install docker-compose-plugin
   ```

2. **Clone & Setup:**
   ```bash
   git clone <your-repo-url>
   cd cursor-token-manager
   cp .env.example .env
   nano .env  # Edit with production values
   ```

3. **Run:**
   ```bash
   docker-compose up -d --build
   ```

4. **Setup Reverse Proxy (Nginx):**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           
           # Timeouts for Playwright
           proxy_read_timeout 300s;
           proxy_connect_timeout 300s;
       }
   }
   ```

5. **Enable SSL:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Option B: Docker Hub (CI/CD)

1. **Build & Push:**
   ```bash
   docker build -t your-username/cursor-token-manager:latest .
   docker push your-username/cursor-token-manager:latest
   ```

2. **Pull & Run on server:**
   ```bash
   docker pull your-username/cursor-token-manager:latest
   docker run -d \
     -p 3000:3000 \
     -e MONGODB_URI="your-connection-string" \
     -e JWT_SECRET="your-jwt-secret" \
     -e WEBHOOK_BASE_URL="your-webhook-url" \
     your-username/cursor-token-manager:latest
   ```

### Option C: Cloud Platforms

**Railway.app:**
1. Connect GitHub repo
2. Add environment variables in dashboard
3. Deploy automatically

**Render.com:**
1. Create new Web Service
2. Link Docker repository
3. Set environment variables
4. Deploy

**DigitalOcean App Platform:**
1. Create App from GitHub
2. Select Dockerfile
3. Configure environment
4. Deploy

---

## 🛠️ Troubleshooting

### Issue: Cannot connect to MongoDB
```bash
# Test connection from container
docker-compose exec app node -e "
  require('mongoose')
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected!'))
    .catch(e => console.error('❌ Error:', e.message))
"

# Common fixes:
# 1. Check IP whitelist in Atlas (Network Access)
# 2. Verify connection string in .env
# 3. Check database user credentials
# 4. Ensure retryWrites=true in connection string
```

### Issue: Playwright/Chromium errors
```bash
# Check Chromium is available
docker-compose exec app chromium-browser --version

# Rebuild with fresh Chromium
docker-compose build --no-cache
docker-compose up -d
```

### Issue: Container won't start
```bash
# Check logs
docker-compose logs app

# Check environment variables
docker-compose exec app env | grep MONGODB_URI

# Verify .env file exists and has correct format
cat .env
```

### Issue: Port 3000 already in use
```bash
# Find process using port
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Change port in docker-compose.yml
ports:
  - "8080:3000"  # External:Internal
```

---

## 📊 Monitoring

### Application Health
```bash
# Check container status
docker-compose ps

# Check health endpoint
curl http://localhost:3000/api/auth/me

# View resource usage
docker stats cursor-token-app
```

### MongoDB Atlas Monitoring
- Go to Atlas dashboard → Metrics
- Monitor:
  - Connection count
  - Operations per second
  - Network traffic
  - Storage usage

### Logs
```bash
# Real-time logs
docker-compose logs -f app

# Save logs to file
docker-compose logs app > app-logs-$(date +%Y%m%d).txt
```

---

## 🔄 Updates & Maintenance

### Update Application Code
```bash
# On your server
cd cursor-token-manager
git pull
docker-compose up -d --build
```

### Update Dependencies
```bash
# Locally
pnpm update

# Commit and deploy
git add pnpm-lock.yaml package.json
git commit -m "Update dependencies"
git push

# On server
git pull
docker-compose up -d --build
```

### Update Docker Images
```bash
# Update base images
docker-compose pull
docker-compose up -d --build
```

---

## 💾 Backup Strategy

### MongoDB Atlas
- **Automatic:** Atlas provides automated backups (included in paid tiers)
- **Manual:** Use `mongodump` from your local machine:
  ```bash
  mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/cursor" --out=./backup
  ```

### Application Files
```bash
# Backup screenshots
tar -czf screenshots-backup-$(date +%Y%m%d).tar.gz ./public/screenshots/

# Backup .env (securely)
cp .env .env.backup-$(date +%Y%m%d)
```

---

## 🎯 Performance Tips

### 1. **Optimize Playwright**
- Use `headless: true` (already set)
- Limit concurrent automations
- Set timeouts appropriately

### 2. **Connection Pooling**
Mongoose automatically handles connection pooling. For custom settings:
```js
// In mongodb.ts
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 2,
  socketTimeoutMS: 45000,
});
```

### 3. **Docker Resource Limits**
Add to `docker-compose.yml`:
```yaml
app:
  # ... existing config
  deploy:
    resources:
      limits:
        cpus: '1.0'
        memory: 1G
      reservations:
        cpus: '0.5'
        memory: 512M
```

---

## 📚 Resources

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Playwright Docker](https://playwright.dev/docs/docker)

---

## 🆘 Support

**Common Issues:**
1. Check logs: `docker-compose logs -f`
2. Verify `.env` file
3. Test MongoDB connection
4. Check Atlas IP whitelist
5. Ensure Docker is running

**Still stuck?**
- Review error messages in logs
- Check MongoDB Atlas status
- Verify all environment variables are set
- Test locally first (`pnpm run dev`)

---

**Happy Deploying! 🚀🐳☁️**

