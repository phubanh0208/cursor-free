# 🐳 Docker Deployment Guide

## 📋 Prerequisites

- Docker & Docker Compose installed
- pnpm (optional, for local development)
- MongoDB access (provided via Docker Compose)

---

## 🚀 Quick Start

### 1. **Setup Environment Variables**

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

Edit `.env` with your production values:
```env
MONGO_ROOT_PASSWORD=your-secure-mongodb-password
JWT_SECRET=your-super-secret-jwt-key
WEBHOOK_BASE_URL=https://n8n.thietkelx.com/webhook-test
NEXTAUTH_SECRET=your-nextauth-secret
```

### 2. **Build & Run with Docker Compose**

```bash
# Build and start all services
docker-compose up -d --build

# Or without cache (clean build)
docker-compose build --no-cache
docker-compose up -d
```

### 3. **Check Service Status**

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f app
docker-compose logs -f mongodb

# Check health status
docker ps --format "table {{.Names}}\t{{.Status}}"
```

---

## 🏗️ Architecture

### Services:

1. **app** (Next.js Application)
   - Port: `3000`
   - Includes Playwright + Chromium for automation
   - Auto-restarts on failure
   - Health checks enabled

2. **mongodb** (MongoDB Database)
   - Port: `27017`
   - Persistent data via Docker volumes
   - Root credentials via environment variables
   - Health checks enabled

3. **mongo-express** (Database UI - Optional)
   - Port: `8081`
   - Web-based MongoDB admin interface
   - Access: `http://localhost:8081`
   - Login: `admin` / `pass` (change in `.env`)

### Networks:
- `cursor-network`: Internal bridge network for service communication

### Volumes:
- `mongodb_data`: Persistent MongoDB database storage
- `mongodb_config`: MongoDB configuration
- `./public/screenshots`: Mounted for Playwright debugging screenshots

---

## 📝 Docker Compose Commands

### Start Services
```bash
# Start all services
docker-compose up -d

# Start specific service
docker-compose up -d app
```

### Stop Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mongodb

# Last 100 lines
docker-compose logs --tail=100 app
```

### Restart Services
```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart app
```

### Rebuild
```bash
# Rebuild and restart (after code changes)
docker-compose up -d --build app

# Force clean rebuild
docker-compose build --no-cache app
docker-compose up -d app
```

### Execute Commands in Container
```bash
# Shell into app container
docker-compose exec app sh

# Shell into MongoDB
docker-compose exec mongodb mongosh -u admin -p yourpassword

# Create admin user (after first run)
docker-compose exec app node scripts/create-admin.js
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_ROOT_PASSWORD` | MongoDB root password | `adminpassword` |
| `MONGODB_URI` | Full MongoDB connection string | Auto-generated |
| `JWT_SECRET` | JWT signing secret | Change in production! |
| `WEBHOOK_BASE_URL` | Base URL for webhooks | `https://n8n.thietkelx.com/webhook-test` |
| `NEXTAUTH_URL` | Public app URL | `http://localhost:3000` |
| `NEXTAUTH_SECRET` | NextAuth.js secret | Change in production! |
| `MONGO_EXPRESS_USER` | Mongo Express username | `admin` |
| `MONGO_EXPRESS_PASSWORD` | Mongo Express password | `pass` |

### Ports

| Service | Internal Port | External Port | Description |
|---------|---------------|---------------|-------------|
| app | 3000 | 3000 | Next.js application |
| mongodb | 27017 | 27017 | MongoDB database |
| mongo-express | 8081 | 8081 | Database UI |

---

## 🛠️ Development Workflow

### Local Development (Without Docker)
```bash
pnpm install
pnpm run dev
```

### Build for Production
```bash
pnpm run build
```

### Test Production Build Locally
```bash
pnpm run build
pnpm start
```

### Docker Development (with hot reload)
For development with Docker, modify `docker-compose.yml`:
```yaml
app:
  command: pnpm run dev
  volumes:
    - .:/app
    - /app/node_modules
```

---

## 🔍 Troubleshooting

### Issue: Container won't start
```bash
# Check logs
docker-compose logs app

# Check if port is already in use
netstat -tuln | grep 3000

# Remove old containers and restart
docker-compose down
docker-compose up -d
```

### Issue: MongoDB connection failed
```bash
# Check MongoDB is running
docker-compose ps mongodb

# Check MongoDB logs
docker-compose logs mongodb

# Verify connection string in .env
echo $MONGODB_URI

# Test connection manually
docker-compose exec app node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected!')).catch(e => console.error(e))"
```

### Issue: Playwright/Chromium errors
```bash
# Rebuild with fresh Chromium install
docker-compose build --no-cache app
docker-compose up -d app

# Check Chromium is available
docker-compose exec app chromium-browser --version
```

### Issue: Out of disk space
```bash
# Clean up Docker images and volumes
docker system prune -a --volumes

# Check disk usage
docker system df
```

### Issue: Permission errors
```bash
# Fix file permissions
sudo chown -R $USER:$USER .

# Restart containers
docker-compose restart
```

---

## 📊 Monitoring & Maintenance

### Health Checks
```bash
# Check application health
curl http://localhost:3000/api/auth/me

# Check MongoDB health
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

### Backup Database
```bash
# Create backup
docker-compose exec mongodb mongodump --uri="mongodb://admin:yourpassword@localhost:27017/cursor-token-db?authSource=admin" --out=/tmp/backup

# Copy backup to host
docker cp cursor-token-mongodb:/tmp/backup ./mongodb-backup-$(date +%Y%m%d)
```

### Restore Database
```bash
# Copy backup to container
docker cp ./mongodb-backup-20240101 cursor-token-mongodb:/tmp/restore

# Restore
docker-compose exec mongodb mongorestore --uri="mongodb://admin:yourpassword@localhost:27017/cursor-token-db?authSource=admin" /tmp/restore
```

### Update Application
```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose up -d --build app
```

---

## 🚀 Production Deployment

### Prerequisites
- VPS/Server with Docker installed
- Domain name (optional)
- SSL certificate (recommended with nginx/Caddy reverse proxy)

### Steps:
1. **Clone repository:**
   ```bash
   git clone <repository-url>
   cd cursor-token-manager
   ```

2. **Setup environment:**
   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

3. **Start services:**
   ```bash
   docker-compose up -d --build
   ```

4. **Create admin user:**
   ```bash
   docker-compose exec app node scripts/create-admin.js
   ```

5. **Setup reverse proxy (nginx example):**
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
       }
   }
   ```

6. **Enable SSL with Certbot:**
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

---

## 📦 Docker Image Size Optimization

Current image size: ~200-300MB (Alpine + Chromium)

To reduce size:
- Use `playwright-chromium` instead of full `playwright`
- Remove unnecessary system packages
- Use multi-stage builds (already implemented)

---

## 🔐 Security Best Practices

1. **Change default passwords** in `.env`
2. **Use strong JWT secrets** (32+ characters, random)
3. **Enable firewall** on server
4. **Restrict MongoDB external access** (use internal network)
5. **Regular backups** of MongoDB data
6. **Keep Docker images updated**:
   ```bash
   docker-compose pull
   docker-compose up -d
   ```

---

## 📚 Additional Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Playwright Docker Guide](https://playwright.dev/docs/docker)
- [MongoDB Docker Hub](https://hub.docker.com/_/mongo)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

## 🆘 Support

For issues or questions:
1. Check logs: `docker-compose logs -f`
2. Review environment variables in `.env`
3. Verify Docker/Docker Compose versions
4. Check GitHub Issues

**Happy Deploying!** 🚀🐳

