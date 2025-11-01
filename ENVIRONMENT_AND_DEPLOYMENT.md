# ENVIRONMENT VARIABLES & DEPLOYMENT GUIDE

## 🔐 ENVIRONMENT VARIABLES (.env)

```bash
# ===== SERVER CONFIGURATION =====
NODE_ENV=production
PORT=5000
API_URL=https://api.eliteeventskenya.com
FRONTEND_URL=https://eliteeventskenya.com

# ===== DATABASE =====
DATABASE_URL=postgresql://username:password@host:5432/elite_events_kenya
# Example: postgresql://admin:securepass@localhost:5432/elite_events_kenya

# ===== REDIS =====
REDIS_URL=redis://host:6379
REDIS_PASSWORD=your_redis_password

# ===== JWT SECRETS =====
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long
JWT_REFRESH_SECRET=your_refresh_token_secret_key
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# ===== AWS S3 =====
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=elite-events-kenya-uploads

# ===== M-PESA (SAFARICOM DARAJA API) =====
MPESA_ENV=sandbox  # or 'production'
MPESA_CONSUMER_KEY=your_mpesa_consumer_key
MPESA_CONSUMER_SECRET=your_mpesa_consumer_secret
MPESA_SHORTCODE=174379  # Your business shortcode
MPESA_PASSKEY=your_mpesa_passkey
MPESA_CALLBACK_URL=https://api.eliteeventskenya.com/api/payments/mpesa/callback

# ===== STRIPE =====
STRIPE_SECRET_KEY=sk_live_...  # or sk_test_... for testing
STRIPE_PUBLISHABLE_KEY=pk_live_...  # or pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# ===== PAYPAL =====
PAYPAL_MODE=live  # or 'sandbox'
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# ===== EMAIL (SENDGRID) =====
SENDGRID_API_KEY=SG.your_sendgrid_api_key
FROM_EMAIL=noreply@eliteeventskenya.com
FROM_NAME=Elite Events Kenya

# Alternative: AWS SES
# AWS_SES_REGION=us-east-1
# AWS_SES_FROM_EMAIL=noreply@eliteeventskenya.com

# ===== SMS (AFRICA'S TALKING) =====
AT_API_KEY=your_africastalking_api_key
AT_USERNAME=your_africastalking_username
AT_SENDER_ID=EliteEvents  # Optional sender ID

# ===== ADMIN CREDENTIALS =====
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_admin_password_change_me

# ===== RATE LIMITING =====
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# ===== CORS =====
ALLOWED_ORIGINS=https://eliteeventskenya.com,https://www.eliteeventskenya.com

# ===== FILE UPLOAD LIMITS =====
MAX_FILE_SIZE_MB=50
MAX_IMAGE_SIZE_MB=5
MAX_VIDEO_SIZE_MB=50
MAX_DOCUMENT_SIZE_MB=5

# ===== CURRENCY =====
DEFAULT_CURRENCY=USD
EXCHANGE_RATE_USD_TO_KES=150  # Update daily via API

# ===== BOOKING SETTINGS =====
SERVICE_FEE_PERCENTAGE=10
CANCELLATION_WINDOW_HOURS=24

# ===== OPTIONAL: CLOUDINARY (Alternative to S3) =====
# CLOUDINARY_CLOUD_NAME=your_cloud_name
# CLOUDINARY_API_KEY=your_api_key
# CLOUDINARY_API_SECRET=your_api_secret

# ===== OPTIONAL: FIREBASE (Push Notifications) =====
# FIREBASE_PROJECT_ID=your_project_id
# FIREBASE_PRIVATE_KEY=your_private_key
# FIREBASE_CLIENT_EMAIL=your_client_email
```

---

## 📦 PACKAGE.JSON

```json
{
  "name": "elite-events-kenya-backend",
  "version": "1.0.0",
  "description": "Backend API for Elite Events Kenya tourism platform",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "migrate": "npx prisma migrate deploy",
    "seed": "node prisma/seed.js",
    "lint": "eslint src/",
    "format": "prettier --write \"src/**/*.js\""
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.4.5",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "@prisma/client": "^5.8.0",
    "pg": "^8.11.3",
    "redis": "^4.6.12",
    "socket.io": "^4.6.1",
    "multer": "^1.4.5-lts.1",
    "multer-s3": "^3.0.1",
    "aws-sdk": "^2.1540.0",
    "express-validator": "^7.0.1",
    "express-rate-limit": "^7.1.5",
    "@sendgrid/mail": "^8.1.0",
    "africastalking": "^0.6.3",
    "axios": "^1.6.5",
    "stripe": "^14.12.0",
    "@paypal/checkout-server-sdk": "^1.0.3",
    "morgan": "^1.10.0",
    "compression": "^1.7.4",
    "uuid": "^9.0.1",
    "date-fns": "^3.2.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.3",
    "jest": "^29.7.0",
    "supertest": "^6.3.4",
    "eslint": "^8.56.0",
    "prettier": "^3.2.4",
    "prisma": "^5.8.0"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

---

## 🐳 DOCKER DEPLOYMENT

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "src/server.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - postgres
      - redis
    restart: unless-stopped
    networks:
      - app-network

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: elite_events_kenya
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped
    networks:
      - app-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
    restart: unless-stopped
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  app-network:
    driver: bridge
```

---

## 🌐 NGINX CONFIGURATION

### nginx.conf
```nginx
events {
    worker_connections 1024;
}

http {
    upstream api_backend {
        server api:5000;
    }

    # HTTP to HTTPS redirect
    server {
        listen 80;
        server_name api.eliteeventskenya.com;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name api.eliteeventskenya.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # API routes
        location / {
            proxy_pass http://api_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Timeouts
            proxy_connect_timeout 60s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        # WebSocket support for Socket.io
        location /socket.io/ {
            proxy_pass http://api_backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        }

        # File upload size limit
        client_max_body_size 50M;
    }
}
```

---

## 🚀 DEPLOYMENT STEPS

### 1. Server Setup (Ubuntu 22.04)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx
sudo apt install -y nginx

# Install Docker & Docker Compose (optional)
sudo apt install -y docker.io docker-compose

# Install PM2 (process manager)
sudo npm install -g pm2
```

### 2. Database Setup
```bash
# Create database
sudo -u postgres psql
CREATE DATABASE elite_events_kenya;
CREATE USER admin WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE elite_events_kenya TO admin;
\q

# Run migrations
npx prisma migrate deploy
```

### 3. Application Deployment
```bash
# Clone repository
git clone https://github.com/your-org/elite-events-backend.git
cd elite-events-backend

# Install dependencies
npm ci --only=production

# Set up environment variables
cp .env.example .env
nano .env  # Edit with your values

# Generate Prisma Client
npx prisma generate

# Start with PM2
pm2 start src/server.js --name elite-api
pm2 save
pm2 startup
```

### 4. SSL Certificate (Let's Encrypt)
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d api.eliteeventskenya.com

# Auto-renewal
sudo certbot renew --dry-run
```

### 5. Monitoring & Logs
```bash
# View PM2 logs
pm2 logs elite-api

# Monitor processes
pm2 monit

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## 📊 PRISMA SCHEMA EXAMPLE

### prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                    String    @id @default(uuid())
  email                 String    @unique
  passwordHash          String    @map("password_hash")
  fullName              String    @map("full_name")
  phone                 String?
  userType              UserType  @map("user_type")
  profileImage          String?   @map("profile_image")
  nationality           String?
  languages             String[]
  verified              Boolean   @default(false)
  emailVerified         Boolean   @default(false) @map("email_verified")
  phoneVerified         Boolean   @default(false) @map("phone_verified")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  lastLogin             DateTime? @map("last_login")
  status                UserStatus @default(ACTIVE)
  
  guide                 Guide?
  bookingsAsTourist     Booking[] @relation("TouristBookings")
  bookingsAsGuide       Booking[] @relation("GuideBookings")
  reviews               Review[]
  sentMessages          Message[] @relation("SentMessages")
  receivedMessages      Message[] @relation("ReceivedMessages")
  payments              Payment[]

  @@index([email])
  @@index([userType])
  @@map("users")
}

enum UserType {
  TOURIST
  GUIDE
  ADMIN
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  DELETED
  PENDING
}

model Guide {
  id                    String    @id @default(uuid())
  userId                String    @unique @map("user_id")
  bio                   String?
  specializations       String[]
  regions               String[]
  yearsExperience       Int?      @map("years_experience")
  hourlyRateUsd         Decimal?  @map("hourly_rate_usd") @db.Decimal(10, 2)
  availabilityStatus    AvailabilityStatus @default(AVAILABLE) @map("availability_status")
  rating                Decimal   @default(0) @db.Decimal(3, 2)
  totalReviews          Int       @default(0) @map("total_reviews")
  totalBookings         Int       @default(0) @map("total_bookings")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  experiences           Experience[]
  bookings              Booking[] @relation("GuideBookings")
  reviews               Review[]

  @@index([userId])
  @@index([rating])
  @@map("guides")
}

enum AvailabilityStatus {
  AVAILABLE
  BUSY
  OFFLINE
}

// Add more models as needed...
```

---

## 🧪 TESTING

### Jest Configuration (jest.config.js)
```javascript
module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};
```

### Example Test (tests/auth.test.js)
```javascript
const request = require('supertest');
const app = require('../src/server');

describe('Authentication', () => {
  test('POST /api/auth/register - should register new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        full_name: 'Test User',
        user_type: 'tourist'
      });
    
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toBeDefined();
  });

  test('POST /api/auth/login - should login user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.data.token).toBeDefined();
  });
});
```

---

## 📝 API DOCUMENTATION (Swagger)

Add Swagger documentation:
```bash
npm install swagger-jsdoc swagger-ui-express
```

Configure in src/server.js:
```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Elite Events Kenya API',
      version: '1.0.0',
      description: 'API documentation for Elite Events Kenya platform'
    },
    servers: [
      {
        url: 'https://api.eliteeventskenya.com',
        description: 'Production server'
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

---

## 🔒 SECURITY CHECKLIST

- [ ] Use HTTPS everywhere
- [ ] Implement rate limiting
- [ ] Validate all inputs
- [ ] Sanitize user data
- [ ] Use parameterized queries (Prisma handles this)
- [ ] Hash passwords with bcrypt (min 10 rounds)
- [ ] Implement CORS properly
- [ ] Use helmet for security headers
- [ ] Keep dependencies updated
- [ ] Implement proper error handling (don't expose stack traces)
- [ ] Use environment variables for secrets
- [ ] Implement audit logging
- [ ] Regular security audits
- [ ] Implement 2FA for admin accounts
- [ ] Monitor for suspicious activity
- [ ] Regular backups
- [ ] Implement CSRF protection
- [ ] Use secure session management
- [ ] Implement proper file upload validation
- [ ] Regular penetration testing
