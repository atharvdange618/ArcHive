# ArcHive VPS Deployment Guide

Complete guide for deploying ArcHive on Hostinger KVM1 VPS with automated CI/CD.

## Server Specifications

- **CPU**: 1 vCPU Core
- **RAM**: 4 GB
- **Storage**: 50 GB NVMe
- **Bandwidth**: 4 TB
- **OS**: Ubuntu 22.04 LTS (recommended)

---

## Table of Contents

1. [CloudPanel Overview](#1-cloudpanel-overview)
2. [Initial Setup](#2-initial-setup)
3. [Domain Configuration](#3-domain-configuration)
4. [MongoDB Setup](#4-mongodb-setup)
5. [Redis Setup](#5-redis-setup)
6. [Create Node.js Site in CloudPanel](#6-create-nodejs-site-in-cloudpanel)
7. [Deploy Application Code](#7-deploy-application-code)
8. [Configure Environment](#8-configure-environment)
9. [SSL Certificate Setup](#9-ssl-certificate-setup)
10. [PM2 Process Manager](#10-pm2-process-manager)
11. [GitHub Actions CI/CD](#11-github-actions-cicd)
12. [Monitoring and Maintenance](#12-monitoring-and-maintenance)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. CloudPanel Overview

CloudPanel is already installed on your VPS and provides:

- **Nginx** web server (pre-configured)
- **SSL certificates** via Let's Encrypt (automated)
- **User management** and site isolation
- **Node.js** runtime management
- **Database management** UI
- **File manager** at `/home/<site-user>/htdocs/`

### CloudPanel Access

- **URL**: `https://your-vps-ip:8443` or `https://admin.archive.net`
- **Default credentials**: Set during VPS setup

---

## 2. Initial Setup

### 2.1 Connect to Your VPS via SSH

```bash
ssh root@your-vps-ip
# Or if you created a user during setup:
# ssh clpuser@your-vps-ip
```

### 2.2 Install Additional Software

CloudPanel comes with most tools pre-installed, but we need a few extras:

```bash
# Switch to root if needed
sudo su -

# Install Bun (for backend runtime)
curl -fsSL https://bun.sh/install | bash
source /root/.bashrc

# Verify Bun installation
bun --version

# Install PM2 globally
npm install -g pm2

# Verify PM2
pm2 --version

# Install git (if not already installed)
apt install -y git
```

---

## 3. Domain Configuration

### 2.1 Point Domain to VPS

In your domain registrar (Namecheap, GoDaddy, Cloudflare, etc.):

1. Go to DNS settings
2. Add/Update these DNS records:

```
Type    Name    Value               TTL
A       @       YOUR_VPS_IP         3600
A       www     YOUR_VPS_IP         3600
A       api     YOUR_VPS_IP         3600
```

**Example**:

- Domain: `archive.example.com`
- API: `api.archive.example.com`
- WWW: `www.archive.example.com`

### 2.2 Verify DNS Propagation

```bash
# Check if DNS is propagated (run on your local machine)
dig archive.example.com
dig api.archive.example.com

# Or use online tool: https://dnschecker.org
```

**Note**: DNS propagation can take 5 minutes to 48 hours.

---

## 3. Install Required Software

### 3.1 Install Node.js (v20 LTS)

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version
```

### 3.2 Install Bun

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Add to PATH
echo 'export BUN_INSTALL="$HOME/.bun"' >> ~/.bashrc
echo 'export PATH="$BUN_INSTALL/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# Verify installation
bun --version
```

### 3.3 Install PM2

```bash
sudo npm install -g pm2

# Verify installation
pm2 --version
```

### 3.4 Install Nginx

```bash
sudo apt install -y nginx

# Start Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Check status
sudo systemctl status nginx
```

---

## 4. MongoDB Setup

**Note**: CloudPanel doesn't include MongoDB by default, so we'll install it manually.

### 4.1 Install MongoDB

```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify
sudo systemctl status mongod
```

### 4.2 Secure MongoDB

```bash
# Connect to MongoDB
mongosh

# In MongoDB shell, create admin user:
use admin
db.createUser({
  user: "admin",
  pwd: "YOUR_STRONG_PASSWORD",  # Change this!
  roles: [ { role: "userAdminAnyDatabase", db: "admin" } ]
})

# Create database and user for ArcHive
use archive
db.createUser({
  user: "archiveuser",
  pwd: "YOUR_ARCHIVE_DB_PASSWORD",  # Change this!
  roles: [ { role: "readWrite", db: "archive" } ]
})

# Exit MongoDB shell
exit
```

### 4.3 Enable Authentication

```bash
# Edit MongoDB config
sudo nano /etc/mongod.conf

# Add/modify these lines:
security:
  authorization: enabled

net:
  bindIp: 127.0.0.1
  port: 27017

# Save and exit (Ctrl+X, Y, Enter)

# Restart MongoDB
sudo systemctl restart mongod
```

### 4.4 Test Connection

```bash
# Test with credentials
mongosh -u archiveuser -p YOUR_ARCHIVE_DB_PASSWORD --authenticationDatabase archive
```

---

## 5. Redis Setup

**Note**: CloudPanel doesn't include Redis by default, so we'll install it manually.

### 5.1 Install Redis

```bash
# Install Redis
sudo apt install -y redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Check status
sudo systemctl status redis-server
```

### 5.2 Configure Redis

```bash
# Edit Redis config
sudo nano /etc/redis/redis.conf

# Find and modify these lines:
bind 127.0.0.1 ::1
supervised systemd
maxmemory 512mb
maxmemory-policy allkeys-lru

# Optional: Set password
requirepass YOUR_REDIS_PASSWORD

# Save and exit

# Restart Redis
sudo systemctl restart redis-server
```

### 5.3 Test Redis

```bash
# Test connection
redis-cli ping
# Should return: PONG

# If you set a password:
redis-cli
auth YOUR_REDIS_PASSWORD
ping
```

---

## 6. Create Node.js Site in CloudPanel

### 6.1 Access CloudPanel

1. Open your browser and go to: `https://your-vps-ip:8443` or `https://admin.archive.net`
2. Login with your CloudPanel credentials

### 6.2 Create Node.js Site for API

1. Click **"Sites"** in the top navigation
2. Click **"+ ADD SITE"** button
3. Fill in the form:
   - **Domain Name**: `api.archive.net` (or your API subdomain)
   - **Site User**: `archive-api` (CloudPanel will create this user)
   - **App**: Select **"Node.js"**
   - **Node.js Version**: Select latest (18.x or 20.x)
   - **App Port**: `3000` (this is where your Bun server will run)
   - **Site Root**: `/home/archive-api/htdocs` (auto-filled)
4. Click **"Create"**

CloudPanel will:

- Create the site user (`archive-api`)
- Setup Nginx configuration automatically
- Create the `/home/archive-api/htdocs` directory
- Configure reverse proxy to port 3000

### 6.3 Create Static Site for Web Frontend (Optional - when ready)

1. Click **"+ ADD SITE"** again
2. Fill in the form:
   - **Domain Name**: `archive.net` or `www.archive.net`
   - **Site User**: `archive` (or use existing user)
   - **App**: Select **"Static HTML"** or **"Node.js"** (if using React/Next.js)
   - **Site Root**: `/home/archive/htdocs`
3. Click **"Create"**

---

## 7. Deploy Application Code

### 7.1 SSH into VPS as Root

```bash
ssh root@your-vps-ip
```

### 7.2 Setup SSH Key for GitHub (if not done already)

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com" -f /root/.ssh/github_deploy

# Copy public key
cat /root/.ssh/github_deploy.pub

# Add this key to GitHub:
# Go to GitHub → Settings → SSH and GPG keys → New SSH key
```

### 7.3 Clone Repository to htdocs

```bash
# Switch to the API site user
su - archive-api

# Navigate to htdocs
cd /home/archive-api/htdocs

# Remove default files
rm -rf *

# Clone your repository (backend only)
git clone git@github.com:atharvdange618/ArcHive.git .

# Or using HTTPS:
# git clone https://github.com/atharvdange618/ArcHive.git .

# Navigate to backend
cd backend
```

### 7.4 Install Bun for Site User

```bash
# Still as archive-api user
curl -fsSL https://bun.sh/install | bash
source /home/archive-api/.bashrc

# Verify
bun --version
```

### 7.5 Install Dependencies

```bash
# In /home/archive-api/htdocs/backend
bun install
```

---

## 8. Configure Environment

### 8.1 Create Environment File

```bash
# As archive-api user
cd /home/archive-api/htdocs/backend

# Copy example env
cp .env.example .env

# Edit environment variables
nano .env
```

Add these values to `.env`:

```bash
# Server
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://archiveuser:YOUR_ARCHIVE_DB_PASSWORD@localhost:27017/archive?authSource=archive

# JWT
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long
JWT_EXPIRATION=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-min-32-chars
REFRESH_TOKEN_EXPIRATION=7d

# CORS (your domains)
CORS_ORIGINS=https://archive.net,https://api.archive.net,https://www.archive.net

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=YOUR_REDIS_PASSWORD

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Save and exit (Ctrl+X, Y, Enter).

---

## 9. SSL Certificate Setup

CloudPanel makes SSL setup very easy!

### 9.1 Enable SSL via CloudPanel

1. Go to CloudPanel → **Sites**
2. Click **"Manage"** next to `api.archive.net`
3. Go to **"SSL/TLS"** tab
4. Click **"Actions"** → **"New Let's Encrypt Certificate"**
5. Click **"Create and Install"**

CloudPanel will automatically:

- Request SSL certificate from Let's Encrypt
- Install the certificate
- Configure Nginx for HTTPS
- Setup auto-renewal

Repeat for your web domain (`archive.net`).

### 9.2 Force HTTPS (Recommended)

In the same SSL/TLS tab:

1. Enable **"Force HTTPS"** toggle
2. All HTTP traffic will redirect to HTTPS---

## 10. PM2 Process Manager

### 10.1 Create PM2 Ecosystem File

```bash
# As archive-api user
cd /home/archive-api/htdocs/backend
nano ecosystem.config.js
```

Add this configuration:

```javascript
module.exports = {
  apps: [
    {
      name: "archive-api",
      script: "/home/archive-api/.bun/bin/bun",
      args: "run src/index.ts",
      cwd: "/home/archive-api/htdocs/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
      error_file: "/home/archive-api/htdocs/logs/api-error.log",
      out_file: "/home/archive-api/htdocs/logs/api-out.log",
      time: true,
    },
    {
      name: "archive-screenshot-worker",
      script: "/home/archive-api/.bun/bin/bun",
      args: "run src/workers/screenshot.worker.ts",
      cwd: "/home/archive-api/htdocs/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
      },
      error_file: "/home/archive-api/htdocs/logs/screenshot-worker-error.log",
      out_file: "/home/archive-api/htdocs/logs/screenshot-worker-out.log",
      time: true,
    },
    {
      name: "archive-tag-worker",
      script: "/home/archive-api/.bun/bin/bun",
      args: "run src/workers/tag.worker.ts",
      cwd: "/home/archive-api/htdocs/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "300M",
      env: {
        NODE_ENV: "production",
      },
      error_file: "/home/archive-api/htdocs/logs/tag-worker-error.log",
      out_file: "/home/archive-api/htdocs/logs/tag-worker-out.log",
      time: true,
    },
  ],
};
```

### 10.2 Create Logs Directory

```bash
# As archive-api user
mkdir -p /home/archive-api/htdocs/logs
```

### 10.3 Start Applications with PM2

```bash
# Still as archive-api user
cd /home/archive-api/htdocs/backend

# Start all processes
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot (as root)
exit  # Exit to root user
pm2 startup systemd -u archive-api --hp /home/archive-api

# Copy and run the command that PM2 outputs
```

### 9.4 PM2 Useful Commands

```bash
# View all processes
pm2 list

# View logs
pm2 logs

# View logs for specific app
pm2 logs archive-api

# Monitor processes
pm2 monit

# Restart all
pm2 restart all

# Restart specific app
pm2 restart archive-api

# Stop all
pm2 stop all

# Delete all processes
pm2 delete all

# Reload process list
pm2 reload ecosystem.config.js
```

---

## 11. GitHub Actions CI/CD

### 11.1 Setup GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add these secrets:

```
VPS_HOST=your-vps-ip-address
VPS_USERNAME=root
VPS_SSH_KEY=<paste your private SSH key>
SITE_USER=archive-api
```

### 11.2 Create SSH Key for GitHub Actions

On your VPS (as root):

```bash
# Generate deployment key
ssh-keygen -t ed25519 -f /root/.ssh/github_actions -C "github-actions"

# Add public key to root's authorized_keys
cat /root/.ssh/github_actions.pub >> /root/.ssh/authorized_keys

# Copy private key to add to GitHub Secrets
cat /root/.ssh/github_actions
# Copy the ENTIRE output (including BEGIN and END lines)
# Add this as VPS_SSH_KEY secret in GitHub
```

### 11.3 Create GitHub Actions Workflow

Create deployment workflow file locally (in your repository):

```bash
mkdir -p .github/workflows
nano .github/workflows/deploy.yml
```

Add this workflow:

````yaml
name: Deploy to VPS (CloudPanel)

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: ${{ secrets.VPS_SSH_KEY }}

      - name: Add VPS to known hosts
        run: |
          ssh-keyscan -H ${{ secrets.VPS_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy to VPS
        env:
          VPS_HOST: ${{ secrets.VPS_HOST }}
          VPS_USERNAME: ${{ secrets.VPS_USERNAME }}
          SITE_USER: ${{ secrets.SITE_USER }}
        run: |
          ssh $VPS_USERNAME@$VPS_HOST << 'ENDSSH'
            set -e

            echo "Deploying ArcHive to CloudPanel..."

            # Switch to site user
            su - ${{ secrets.SITE_USER }} << 'ENDSU'
              set -e

              # Navigate to project directory
              cd /home/${{ secrets.SITE_USER }}/htdocs

              # Pull latest changes
              echo "Pulling latest code..."
              git pull origin main

              # Backend deployment
              echo "Installing backend dependencies..."
              cd backend
              /home/${{ secrets.SITE_USER }}/.bun/bin/bun install

              # Restart PM2 processes
              echo "Restarting backend services..."
              pm2 reload ecosystem.config.js

              # Check PM2 status
              pm2 status

              echo "Deployment completed successfully!"
            ENDSU
          ENDSSH

      - name: Verify Deployment
        env:
          VPS_HOST: ${{ secrets.VPS_HOST }}
          VPS_USERNAME: ${{ secrets.VPS_USERNAME }}
          SITE_USER: ${{ secrets.SITE_USER }}
        run: |
          ssh $VPS_USERNAME@$VPS_HOST << 'ENDSSH'
            # Wait for services to start
            sleep 5

            # Check if API is responding
            curl -f http://localhost:3000/api/health || echo "API health check failed"

            # Show PM2 status as site user
            su - ${{ secrets.SITE_USER }} -c "pm2 list"
          ENDSSH

      - name: Notification
        if: always()
        run: |
          if [ ${{ job.status }} == 'success' ]; then
            echo "Deployment successful!"
          else
            echo "Deployment failed!"
          fi
```### 11.4 Add Health Check Endpoint to Backend

Create a simple health check route:

```bash
cd /var/www/archive/backend
nano src/routes/health.ts
````

```typescript
import { Hono } from "hono";

const healthRoutes = new Hono();

healthRoutes.get("/", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default healthRoutes;
```

Update `src/app.ts` to include health route:

```typescript
import healthRoutes from "./routes/health";

// Add near other routes
app.route("/api/health", healthRoutes);
```

### 11.5 Test Automated Deployment

```bash
# On your local machine
git add .github/workflows/deploy.yml
git commit -m "Add CI/CD workflow"
git push origin main

# GitHub Actions will automatically deploy!
# Check progress: GitHub → Actions tab
```

---

## 12. Monitoring and Maintenance

### 12.1 CloudPanel File Manager

You can manage files directly in CloudPanel:

1. Go to **Sites** → Click **Manage** on your site
2. Go to **File Manager** tab
3. Browse `/home/archive-api/htdocs/`

### 12.2 Setup PM2 Monitoring

```bash
# As site user (archive-api)
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
```

### 12.3 Database Backups

Create backup script (as root):

```bash
# As root
nano /root/backup-mongodb.sh
```

```bash
#!/bin/bash

BACKUP_DIR="/home/archive-api/backups/mongodb"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MONGODB_USER="archiveuser"
MONGODB_PASS="YOUR_ARCHIVE_DB_PASSWORD"
MONGODB_DB="archive"

# Create backup directory
mkdir -p $BACKUP_DIR

# Create backup
mongodump --username=$MONGODB_USER --password=$MONGODB_PASS \
  --authenticationDatabase=$MONGODB_DB --db=$MONGODB_DB \
  --out=$BACKUP_DIR/$TIMESTAMP

# Compress backup
tar -czf $BACKUP_DIR/archive_$TIMESTAMP.tar.gz -C $BACKUP_DIR $TIMESTAMP
rm -rf $BACKUP_DIR/$TIMESTAMP

# Keep only last 7 days of backups
find $BACKUP_DIR -name "archive_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/archive_$TIMESTAMP.tar.gz"
```

Make executable and schedule:

```bash
chmod +x /root/backup-mongodb.sh

# Add to crontab (daily at 2 AM)
crontab -e

# Add this line:
0 2 * * * /root/backup-mongodb.sh >> /home/archive-api/htdocs/logs/backup.log 2>&1
```

### 12.4 System Monitoring

```bash
# Install htop for monitoring
sudo apt install -y htop

# Monitor resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# Check MongoDB status
sudo systemctl status mongod

# Check Redis status
sudo systemctl status redis-server

# Check Nginx status (CloudPanel manages it)
sudo systemctl status nginx

# CloudPanel Dashboard
# Access at https://admin.archive.net
# View server resources, sites, databases
```

### 12.5 Log Management

```bash
# View PM2 logs (as site user)
su - archive-api
pm2 logs --lines 100

# View Nginx logs (CloudPanel location)
sudo tail -f /var/log/nginx/access.log

# View site-specific Nginx logs
sudo tail -f /home/archive-api/logs/nginx/access.log
sudo tail -f /home/archive-api/logs/nginx/error.log

# View MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# View Redis logs
sudo tail -f /var/log/redis/redis-server.log
```

---

## 13. Troubleshooting

### 13.1 API Not Responding

```bash
# Switch to site user
su - archive-api

# Check if process is running
pm2 list

# Check logs
pm2 logs archive-api --lines 50

# Restart API
pm2 restart archive-api

# Check if port 3000 is listening
sudo netstat -tulpn | grep :3000

# Check CloudPanel site configuration
# Go to CloudPanel → Sites → Manage → Settings
# Verify App Port is set to 3000
```

### 13.2 Database Connection Issues

```bash
# Check MongoDB status
sudo systemctl status mongod

# Test connection
mongosh -u archiveuser -p YOUR_ARCHIVE_DB_PASSWORD --authenticationDatabase archive

# Restart MongoDB
sudo systemctl restart mongod

# Check logs
sudo tail -f /var/log/mongodb/mongod.log
```

### 13.3 Redis Connection Issues

```bash
# Check Redis status
sudo systemctl status redis-server

# Test connection
redis-cli ping

# Restart Redis
sudo systemctl restart redis-server
```

### 13.4 Nginx Issues

```bash
# CloudPanel manages Nginx
# Check status
sudo systemctl status nginx

# Restart Nginx (if needed)
sudo systemctl restart nginx

# Check site-specific error logs
sudo tail -f /home/archive-api/logs/nginx/error.log

# Reload CloudPanel Nginx configs
# Go to CloudPanel → Sites → Manage → click "Reload"
```

### 13.5 SSL Certificate Issues

CloudPanel manages SSL automatically. If issues occur:

1. Go to CloudPanel → Sites → Manage your site
2. Go to SSL/TLS tab
3. Click "Actions" → "Delete Certificate"
4. Click "New Let's Encrypt Certificate"
5. Create and install again

Or via CLI:

```bash
# Check certificate (as root)
sudo certbot certificates
```

### 13.6 Permission Issues

```bash
# Fix htdocs permissions
sudo chown -R archive-api:archive-api /home/archive-api/htdocs
sudo chmod -R 755 /home/archive-api/htdocs

# Fix log permissions
sudo chown -R archive-api:archive-api /home/archive-api/htdocs/logs
```

### 13.7 Memory Issues (4GB VPS)

If you experience memory issues:

```bash
# Check memory usage
free -h

# As site user
su - archive-api
pm2 monit

# Restart specific high-memory process
pm2 restart archive-screenshot-worker

# Reduce PM2 instances in ecosystem.config.js
# Set max_memory_restart lower

# Check CloudPanel resource usage
# Go to CloudPanel Dashboard to see overall server stats
```

### 13.8 Workers Not Processing Jobs

```bash
# As site user
su - archive-api

# Check worker logs
pm2 logs archive-screenshot-worker
pm2 logs archive-tag-worker

# Check Redis connection
redis-cli
PING

# Restart workers
pm2 restart archive-screenshot-worker
pm2 restart archive-tag-worker
```

### 13.9 Deployment Failed

```bash
# SSH into VPS as root
ssh root@your-vps-ip

# Switch to site user
su - archive-api

# Check git status
cd /home/archive-api/htdocs
git status
git log -1

# Manual pull
git pull origin main

# Reinstall dependencies
cd backend
bun install

# Restart PM2
pm2 reload ecosystem.config.js

# Check PM2 status
pm2 status
pm2 logs
```

### 13.10 CloudPanel Issues

```bash
# Restart CloudPanel
sudo systemctl restart clp

# Check CloudPanel status
sudo systemctl status clp

# CloudPanel logs
sudo tail -f /var/log/clp/clp.log

# Access CloudPanel via SSH tunnel if port 8443 is blocked
ssh -L 8443:localhost:8443 root@your-vps-ip
# Then access: https://localhost:8443
```

---

## Mobile App Configuration

After deployment, update your mobile app to use the production API:

```typescript
// mobile/constants/index.ts
export const API_BASE_URL = "https://api.archive.net/api";
```

Rebuild and deploy your mobile app:

```bash
cd mobile
npm run build:android  # or build:ios
```

---

## CloudPanel-Specific Notes

### Site Structure

- **Site User**: `archive-api` (isolated user for security)
- **Document Root**: `/home/archive-api/htdocs/`
- **Logs**: `/home/archive-api/logs/`
- **Nginx Config**: Auto-managed by CloudPanel
- **SSL**: Auto-managed by CloudPanel via Let's Encrypt

### Benefits of CloudPanel

- ✅ Automatic Nginx configuration
- ✅ Easy SSL management
- ✅ User isolation (each site has its own user)
- ✅ Web-based file manager
- ✅ Database management UI
- ✅ One-click SSL certificates
- ✅ Automatic security headers

### Important Paths

```bash
# Application code
/home/archive-api/htdocs/backend/

# PM2 logs
/home/archive-api/htdocs/logs/

# Nginx logs
/home/archive-api/logs/nginx/

# Site user home
/home/archive-api/

# Bun binary
/home/archive-api/.bun/bin/bun
```

---

## Security Checklist

- [ ] Firewall configured (UFW enabled)
- [ ] MongoDB authentication enabled
- [ ] Redis password set
- [ ] Strong JWT secrets
- [ ] SSL certificates installed
- [ ] Non-root user created
- [ ] SSH key authentication (disable password auth recommended)
- [ ] Regular backups configured
- [ ] Log rotation enabled
- [ ] Rate limiting configured in backend
- [ ] CORS properly configured
- [ ] Environment variables not committed to git

---

## Performance Optimization

### Enable Nginx Caching

```bash
sudo nano /etc/nginx/nginx.conf

# Add inside http block:
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m use_temp_path=off;
```

### MongoDB Indexes

Ensure indexes are created (should be automatic from your models):

```bash
mongosh -u archiveuser -p YOUR_ARCHIVE_DB_PASSWORD --authenticationDatabase archive

use archive
db.contentitems.getIndexes()

# If text index doesn't exist:
db.contentitems.createIndex({ title: "text", description: "text", content: "text", url: "text" })
```

---

## Useful Commands Reference

```bash
# System (as root)
sudo systemctl restart nginx
sudo systemctl restart mongod
sudo systemctl restart redis-server
sudo systemctl restart clp  # CloudPanel

# Switch to site user
su - archive-api

# PM2 (as site user)
pm2 list
pm2 logs
pm2 restart all
pm2 monit
pm2 save

# Logs
pm2 logs --lines 100
sudo tail -f /home/archive-api/logs/nginx/error.log
sudo tail -f /home/archive-api/htdocs/logs/api-error.log

# Resources
htop
df -h
free -h

# Git (as site user)
cd /home/archive-api/htdocs
git pull origin main
git status

# Backup (as root)
/root/backup-mongodb.sh

# CloudPanel
# Web UI: https://admin.archive.net:8443
```

---

## Support

If you encounter issues:

1. Check relevant logs
2. Verify all services are running
3. Test connectivity
4. Review recent changes
5. Check GitHub Actions workflow logs

---

**Deployment Complete!**

Your ArcHive application should now be:

- Running at: `https://archive.example.com` (web)
- API at: `https://api.archive.example.com`
- Auto-deploying on every push to main branch
- Monitored with PM2
- Secured with SSL
- Backed up daily

Remember to replace all placeholder values (passwords, domain names, etc.) with your actual values!
