# Deployment Guide - Kenya Unfiltered

## Overview
This guide walks you through deploying Kenya Unfiltered to production, from initial setup to going live.

---

## Pre-Deployment Checklist

### 1. Content Updates
- [ ] Replace all placeholder phone numbers (+254 700 000 000)
- [ ] Update email addresses (info@kenyaunfiltered.com)
- [ ] Add real guide profiles and images
- [ ] Update social media links
- [ ] Add actual experience listings
- [ ] Update company address

### 2. Configuration
- [ ] Set up domain name
- [ ] Configure SSL certificate
- [ ] Set up email service (SendGrid/AWS SES)
- [ ] Configure payment gateways
- [ ] Set up Google Analytics
- [ ] Create Google My Business profile

### 3. Testing
- [ ] Test all forms
- [ ] Verify mobile responsiveness
- [ ] Check cross-browser compatibility
- [ ] Test payment flows (sandbox mode)
- [ ] Verify email notifications
- [ ] Test search functionality

---

## Hosting Options

### Option 1: Shared Hosting (Beginner-Friendly)

**Recommended Providers:**
- Bluehost
- SiteGround
- HostGator
- Namecheap

**Steps:**
1. Purchase hosting plan
2. Upload files via FTP/cPanel File Manager
3. Configure domain
4. Enable SSL (Let's Encrypt)
5. Set up email accounts

**Pros:** Easy, affordable, managed
**Cons:** Limited scalability, shared resources

### Option 2: VPS Hosting (Recommended)

**Recommended Providers:**
- DigitalOcean
- Linode
- Vultr
- AWS Lightsail

**Steps:**
1. Create VPS instance (Ubuntu 22.04 LTS)
2. Configure server (see Server Setup below)
3. Deploy application
4. Set up SSL with Let's Encrypt
5. Configure firewall

**Pros:** Full control, scalable, better performance
**Cons:** Requires technical knowledge

### Option 3: Cloud Hosting (Enterprise)

**Recommended Providers:**
- AWS (S3 + CloudFront + EC2)
- Google Cloud Platform
- Microsoft Azure

**Pros:** Highly scalable, global CDN, enterprise features
**Cons:** Complex setup, higher cost

---

## Server Setup (VPS/Cloud)

### 1. Initial Server Configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y

# Install Node.js (for backend)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install Redis
sudo apt install redis-server -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

### 2. Configure Nginx

```nginx
# /etc/nginx/sites-available/kenyaunfiltered.com

server {
    listen 80;
    server_name kenyaunfiltered.com www.kenyaunfiltered.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name kenyaunfiltered.com www.kenyaunfiltered.com;

    ssl_certificate /etc/letsencrypt/live/kenyaunfiltered.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kenyaunfiltered.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Frontend
    root /var/www/kenyaunfiltered/frontend;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;
}
```

### 3. Enable Site and SSL

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/kenyaunfiltered.com /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Obtain SSL certificate
sudo certbot --nginx -d kenyaunfiltered.com -d www.kenyaunfiltered.com

# Reload Nginx
sudo systemctl reload nginx

# Set up auto-renewal
sudo certbot renew --dry-run
```

---

## Frontend Deployment

### 1. Prepare Files

```bash
# On your local machine
cd Elite

# Minify CSS (optional)
# Use online tools or build tools

# Optimize images
# Compress all images in /images folder

# Update configuration
# Replace all API endpoints with production URLs
```

### 2. Upload to Server

**Option A: Using SCP**
```bash
scp -r Elite/* user@your-server-ip:/var/www/kenyaunfiltered/frontend/
```

**Option B: Using Git**
```bash
# On server
cd /var/www/kenyaunfiltered
git clone https://github.com/your-username/kenya-unfiltered.git frontend
```

**Option C: Using FTP**
- Use FileZilla or similar FTP client
- Upload all files to web root directory

### 3. Set Permissions

```bash
sudo chown -R www-data:www-data /var/www/kenyaunfiltered
sudo chmod -R 755 /var/www/kenyaunfiltered
```

---

## Backend Deployment

### 1. Set Up Application

```bash
# Create application directory
sudo mkdir -p /var/www/kenyaunfiltered/backend
cd /var/www/kenyaunfiltered/backend

# Clone repository
git clone https://github.com/your-username/kenya-unfiltered-api.git .

# Install dependencies
npm install --production

# Create .env file
sudo nano .env
# Add all environment variables (see BACKEND_DOCUMENTATION.md)
```

### 2. Set Up Database

```bash
# Access PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE kenya_unfiltered;
CREATE USER kenya_admin WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE kenya_unfiltered TO kenya_admin;
\q

# Run migrations
npm run migrate
```

### 3. Set Up Process Manager (PM2)

```bash
# Install PM2
sudo npm install -g pm2

# Start application
pm2 start server.js --name kenya-unfiltered-api

# Set up auto-start
pm2 startup
pm2 save

# Monitor application
pm2 status
pm2 logs kenya-unfiltered-api
```

---

## Payment Gateway Setup

### M-Pesa (Safaricom)

1. Register at https://developer.safaricom.co.ke/
2. Create an app
3. Get Consumer Key and Consumer Secret
4. Register callback URLs
5. Test in sandbox environment
6. Apply for production access
7. Update environment variables

### Stripe

1. Create account at https://stripe.com
2. Get API keys (test and live)
3. Configure webhook endpoints
4. Test with test cards
5. Activate live mode
6. Update environment variables

### PayPal

1. Create business account
2. Get API credentials
3. Set up webhook notifications
4. Test in sandbox
5. Switch to live mode
6. Update environment variables

---

## Email Service Setup

### SendGrid

```bash
# Install SendGrid
npm install @sendgrid/mail

# Get API key from SendGrid dashboard
# Add to environment variables
SENDGRID_API_KEY=your_api_key

# Verify sender email
# Configure email templates
```

---

## Google Services Setup

### Google Analytics

1. Create GA4 property
2. Get Measurement ID
3. Update in all HTML files:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
```

### Google Search Console

1. Add property
2. Verify ownership (DNS or HTML file)
3. Submit sitemap: https://kenyaunfiltered.com/sitemap.xml
4. Monitor indexing status

### Google My Business

1. Create business profile
2. Verify business
3. Add photos and information
4. Enable messaging
5. Add booking link

---

## CDN Setup (Optional but Recommended)

### Cloudflare (Free)

1. Create Cloudflare account
2. Add your domain
3. Update nameservers at domain registrar
4. Enable:
   - Auto Minify (CSS, JS, HTML)
   - Brotli compression
   - Always Use HTTPS
   - Automatic HTTPS Rewrites
5. Configure caching rules
6. Set up page rules

---

## Monitoring & Maintenance

### 1. Set Up Monitoring

**Uptime Monitoring:**
- UptimeRobot (free)
- Pingdom
- StatusCake

**Error Tracking:**
- Sentry
- Rollbar
- Bugsnag

**Performance Monitoring:**
- Google PageSpeed Insights
- GTmetrix
- WebPageTest

### 2. Backup Strategy

```bash
# Database backup script
#!/bin/bash
BACKUP_DIR="/var/backups/kenya-unfiltered"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump kenya_unfiltered > $BACKUP_DIR/db_backup_$DATE.sql

# Backup files
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /var/www/kenyaunfiltered

# Keep only last 7 days
find $BACKUP_DIR -type f -mtime +7 -delete
```

**Set up cron job:**
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup-script.sh
```

### 3. Security Updates

```bash
# Set up automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure --priority=low unattended-upgrades
```

---

## Post-Deployment Tasks

### 1. SEO Setup
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Create Google My Business profile
- [ ] Set up social media profiles
- [ ] Start content marketing

### 2. Marketing
- [ ] Launch social media campaigns
- [ ] Start email marketing
- [ ] Create blog content
- [ ] Reach out to travel bloggers
- [ ] Submit to travel directories

### 3. Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure error tracking
- [ ] Monitor analytics daily
- [ ] Track keyword rankings
- [ ] Monitor server resources

---

## Troubleshooting

### Common Issues

**1. 502 Bad Gateway**
- Check if backend is running: `pm2 status`
- Check backend logs: `pm2 logs`
- Verify Nginx configuration

**2. SSL Certificate Issues**
- Renew certificate: `sudo certbot renew`
- Check certificate status: `sudo certbot certificates`

**3. Database Connection Errors**
- Check PostgreSQL status: `sudo systemctl status postgresql`
- Verify database credentials in .env
- Check firewall rules

**4. Slow Page Load**
- Enable Gzip compression
- Optimize images
- Use CDN
- Enable browser caching

---

## Support

For deployment assistance:
- Email: dev@kenyaunfiltered.com
- Documentation: https://docs.kenyaunfiltered.com

---

**Last Updated:** October 31, 2025
