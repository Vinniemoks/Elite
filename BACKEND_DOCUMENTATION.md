# Kenya Unfiltered - Backend Integration Documentation

## Table of Contents
1. [Overview](#overview)
2. [Technology Stack Recommendations](#technology-stack)
3. [Database Schema](#database-schema)
4. [API Endpoints](#api-endpoints)
5. [Authentication & Authorization](#authentication)
6. [Payment Integration](#payment-integration)
7. [Real-time Features](#real-time-features)
8. [File Upload & Storage](#file-storage)
9. [Email & Notifications](#notifications)
10. [Security Considerations](#security)
11. [Deployment Guide](#deployment)

---

## Overview

This document provides comprehensive guidance for building the backend system to support the Kenya Unfiltered platform. The frontend is designed to work with RESTful APIs and supports modern authentication patterns.

### Key Features to Implement
- User authentication (tourists & guides)
- Booking management system
- Payment processing (M-Pesa, Cards, PayPal)
- Real-time messaging between tourists and guides
- Review and rating system
- Search and filtering
- Admin dashboard
- Analytics and reporting

---

## Technology Stack Recommendations

### Option 1: Node.js + Express (Recommended)
```
Backend: Node.js with Express.js
Database: PostgreSQL (primary) + Redis (caching)
ORM: Prisma or Sequelize
Authentication: JWT + Passport.js
Real-time: Socket.io
File Storage: AWS S3 or Cloudinary
Email: SendGrid or AWS SES
```

### Option 2: Python + Django
```
Backend: Django + Django REST Framework
Database: PostgreSQL
Authentication: Django Auth + JWT
Real-time: Django Channels
File Storage: AWS S3
Email: Django Email Backend
```

### Option 3: PHP + Laravel
```
Backend: Laravel
Database: MySQL/PostgreSQL
Authentication: Laravel Sanctum
Real-time: Laravel Echo + Pusher
File Storage: Laravel Storage (S3)
Email: Laravel Mail
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type ENUM('tourist', 'guide', 'admin') NOT NULL,
    profile_image VARCHAR(500),
    nationality VARCHAR(100),
    languages TEXT[], -- Array of languages
    verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    status ENUM('active', 'suspended', 'deleted') DEFAULT 'active'
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
```


### Guides Table
```sql
CREATE TABLE guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    bio TEXT,
    specializations TEXT[], -- e.g., ['nightlife', 'cultural', 'adventure']
    regions TEXT[], -- e.g., ['Nairobi', 'Mombasa', 'Rift Valley']
    years_experience INTEGER,
    hourly_rate_usd DECIMAL(10, 2),
    availability_status ENUM('available', 'busy', 'offline') DEFAULT 'available',
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
    verification_documents JSONB, -- Store document URLs and status
    certifications TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guides_user ON guides(user_id);
CREATE INDEX idx_guides_regions ON guides USING GIN(regions);
CREATE INDEX idx_guides_rating ON guides(rating DESC);
```

### Experiences Table
```sql
CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    guide_id UUID REFERENCES guides(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100), -- 'nightlife', 'cultural', 'adventure', etc.
    duration_hours DECIMAL(4, 2),
    price_usd DECIMAL(10, 2) NOT NULL,
    max_guests INTEGER DEFAULT 1,
    location VARCHAR(255),
    meeting_point VARCHAR(500),
    included_items TEXT[],
    excluded_items TEXT[],
    requirements TEXT,
    images TEXT[], -- Array of image URLs
    status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_bookings INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_experiences_guide ON experiences(guide_id);
CREATE INDEX idx_experiences_category ON experiences(category);
CREATE INDEX idx_experiences_status ON experiences(status);
```

### Bookings Table
```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tourist_id UUID REFERENCES users(id),
    guide_id UUID REFERENCES guides(id),
    experience_id UUID REFERENCES experiences(id),
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    number_of_guests INTEGER DEFAULT 1,
    total_price_usd DECIMAL(10, 2) NOT NULL,
    service_fee_usd DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    exchange_rate DECIMAL(10, 4),
    special_requests TEXT,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'refunded') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_id VARCHAR(255),
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(id),
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_tourist ON bookings(tourist_id);
CREATE INDEX idx_bookings_guide ON bookings(guide_id);
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);
```


### Reviews Table
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    tourist_id UUID REFERENCES users(id),
    guide_id UUID REFERENCES guides(id),
    experience_id UUID REFERENCES experiences(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    images TEXT[],
    response TEXT, -- Guide's response to review
    response_date TIMESTAMP,
    helpful_count INTEGER DEFAULT 0,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_guide ON reviews(guide_id);
CREATE INDEX idx_reviews_experience ON reviews(experience_id);
CREATE INDEX idx_reviews_rating ON reviews(rating DESC);
```

### Messages Table
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID REFERENCES users(id),
    receiver_id UUID REFERENCES users(id),
    booking_id UUID REFERENCES bookings(id),
    message TEXT NOT NULL,
    attachments TEXT[],
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
CREATE INDEX idx_messages_booking ON messages(booking_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

### Payments Table
```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES bookings(id),
    user_id UUID REFERENCES users(id),
    amount_usd DECIMAL(10, 2) NOT NULL,
    amount_local DECIMAL(10, 2),
    currency VARCHAR(3),
    payment_method VARCHAR(50), -- 'mpesa', 'card', 'paypal'
    payment_provider VARCHAR(50),
    transaction_id VARCHAR(255) UNIQUE,
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
```

---

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
Register a new user (tourist or guide)
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+254700000000",
  "user_type": "tourist",
  "nationality": "USA"
}

Response (201):
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "user_type": "tourist"
    },
    "token": "jwt_token_here"
  }
}
```

#### POST /api/auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response (200):
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "user_type": "tourist",
      "profile_image": "url"
    },
    "token": "jwt_token_here"
  }
}
```


#### POST /api/auth/forgot-password
#### POST /api/auth/reset-password
#### POST /api/auth/verify-email
#### POST /api/auth/refresh-token

### Guide Endpoints

#### GET /api/guides
Get all guides with filtering and pagination
```
Query Parameters:
- page: integer (default: 1)
- limit: integer (default: 20)
- region: string (e.g., 'Nairobi')
- specialization: string
- min_rating: decimal
- sort_by: string (rating, price, reviews)
- search: string

Response (200):
{
  "success": true,
  "data": {
    "guides": [...],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "items_per_page": 20
    }
  }
}
```

#### GET /api/guides/:id
Get single guide details

#### POST /api/guides (Auth required - Guide)
Create guide profile

#### PUT /api/guides/:id (Auth required - Guide)
Update guide profile

#### GET /api/guides/:id/availability
Get guide's availability calendar

### Experience Endpoints

#### GET /api/experiences
Get all experiences with filtering
```
Query Parameters:
- category: string
- location: string
- min_price: decimal
- max_price: decimal
- duration: decimal
- rating: decimal
- page: integer
- limit: integer
```

#### GET /api/experiences/:id
Get single experience details

#### POST /api/experiences (Auth required - Guide)
Create new experience

#### PUT /api/experiences/:id (Auth required - Guide)
Update experience

#### DELETE /api/experiences/:id (Auth required - Guide)
Delete experience

### Booking Endpoints

#### POST /api/bookings
Create a new booking
```json
Request:
{
  "experience_id": "uuid",
  "guide_id": "uuid",
  "booking_date": "2025-11-15",
  "booking_time": "14:00",
  "number_of_guests": 2,
  "special_requests": "Vegetarian meals please",
  "currency": "USD"
}

Response (201):
{
  "success": true,
  "data": {
    "booking": {
      "id": "uuid",
      "booking_date": "2025-11-15",
      "total_price_usd": 34.00,
      "service_fee_usd": 3.40,
      "status": "pending",
      "payment_url": "https://payment-gateway.com/checkout/..."
    }
  }
}
```

#### GET /api/bookings (Auth required)
Get user's bookings

#### GET /api/bookings/:id (Auth required)
Get booking details

#### PUT /api/bookings/:id/cancel (Auth required)
Cancel a booking

#### PUT /api/bookings/:id/confirm (Auth required - Guide)
Confirm a booking

### Payment Endpoints

#### POST /api/payments/mpesa/initiate
Initiate M-Pesa payment

#### POST /api/payments/mpesa/callback
M-Pesa callback handler

#### POST /api/payments/card/process
Process card payment

#### POST /api/payments/paypal/create
Create PayPal payment

#### GET /api/payments/:id/status
Check payment status

### Review Endpoints

#### POST /api/reviews
Create a review
```json
Request:
{
  "booking_id": "uuid",
  "rating": 5,
  "comment": "Amazing experience!",
  "images": ["url1", "url2"]
}
```

#### GET /api/reviews/guide/:guideId
Get reviews for a guide

#### GET /api/reviews/experience/:experienceId
Get reviews for an experience

#### PUT /api/reviews/:id/response (Auth required - Guide)
Respond to a review

### Message Endpoints

#### GET /api/messages/conversations (Auth required)
Get user's conversations

#### GET /api/messages/conversation/:userId (Auth required)
Get messages with specific user

#### POST /api/messages (Auth required)
Send a message

#### PUT /api/messages/:id/read (Auth required)
Mark message as read

### Search Endpoint

#### GET /api/search
Global search across guides and experiences
```
Query Parameters:
- q: string (search query)
- category: string
- type: string (guides, experiences, all)
```

---

## Authentication & Authorization

### JWT Token Structure
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "user_type": "tourist",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Middleware Implementation (Node.js Example)
```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

const guideOnly = (req, res, next) => {
  if (req.user.user_type !== 'guide') {
    return res.status(403).json({ 
      success: false, 
      message: 'Guide access required' 
    });
  }
  next();
};
```


---

## Payment Integration

### M-Pesa Integration (Safaricom)

#### Setup
1. Register for M-Pesa Daraja API at https://developer.safaricom.co.ke/
2. Get Consumer Key and Consumer Secret
3. Register callback URLs

#### Implementation Example (Node.js)
```javascript
const axios = require('axios');

class MPesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
  }

  async getAccessToken() {
    const auth = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`
    ).toString('base64');
    
    const response = await axios.get(
      'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`
        }
      }
    );
    
    return response.data.access_token;
  }

  async initiateSTKPush(phoneNumber, amount, accountReference) {
    const token = await this.getAccessToken();
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(
      `${this.shortcode}${this.passkey}${timestamp}`
    ).toString('base64');

    const response = await axios.post(
      'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: amount,
        PartyA: phoneNumber,
        PartyB: this.shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: 'Kenya Unfiltered Booking Payment'
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    return response.data;
  }
}
```

### Stripe Integration (Cards)

```javascript
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createPaymentIntent(amount, currency, metadata) {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100), // Convert to cents
    currency: currency.toLowerCase(),
    metadata: metadata,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  return paymentIntent;
}
```

### PayPal Integration

```javascript
const paypal = require('@paypal/checkout-server-sdk');

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
}

async function createOrder(amount, currency) {
  const request = new paypal.orders.OrdersCreateRequest();
  request.prefer("return=representation");
  request.requestBody({
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount.toFixed(2)
      }
    }]
  });

  const client = new paypal.core.PayPalHttpClient(environment());
  const response = await client.execute(request);
  return response.result;
}
```

---

## Real-time Features

### Socket.io Implementation (Node.js)

```javascript
const io = require('socket.io')(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// Authentication middleware for socket
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.user_id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Join user's personal room
  socket.join(`user_${socket.userId}`);
  
  // Handle sending messages
  socket.on('send_message', async (data) => {
    const { receiverId, message, bookingId } = data;
    
    // Save message to database
    const savedMessage = await saveMessage({
      senderId: socket.userId,
      receiverId,
      message,
      bookingId
    });
    
    // Emit to receiver
    io.to(`user_${receiverId}`).emit('new_message', savedMessage);
    
    // Confirm to sender
    socket.emit('message_sent', savedMessage);
  });
  
  // Handle typing indicator
  socket.on('typing', (data) => {
    io.to(`user_${data.receiverId}`).emit('user_typing', {
      userId: socket.userId,
      isTyping: true
    });
  });
  
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});
```

### Frontend Socket.io Integration

```javascript
// In your frontend JavaScript
const socket = io('https://api.kenyaunfiltered.com', {
  auth: {
    token: localStorage.getItem('authToken')
  }
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('new_message', (message) => {
  displayMessage(message);
  showNotification('New message received');
});

function sendMessage(receiverId, message, bookingId) {
  socket.emit('send_message', {
    receiverId,
    message,
    bookingId
  });
}
```

---

## File Upload & Storage

### AWS S3 Configuration

```javascript
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const fileName = `${Date.now()}-${file.originalname}`;
      cb(null, `uploads/${fileName}`);
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Usage in route
app.post('/api/upload', upload.single('image'), (req, res) => {
  res.json({
    success: true,
    url: req.file.location
  });
});
```


---

## Email & Notifications

### SendGrid Email Service

```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  async sendBookingConfirmation(booking, user) {
    const msg = {
      to: user.email,
      from: 'noreply@kenyaunfiltered.com',
      subject: 'Booking Confirmation - Kenya Unfiltered',
      html: `
        <h1>Booking Confirmed!</h1>
        <p>Dear ${user.full_name},</p>
        <p>Your booking has been confirmed.</p>
        <h3>Booking Details:</h3>
        <ul>
          <li>Booking ID: ${booking.id}</li>
          <li>Date: ${booking.booking_date}</li>
          <li>Time: ${booking.booking_time}</li>
          <li>Total: $${booking.total_price_usd}</li>
        </ul>
        <p>Your guide will contact you shortly.</p>
      `
    };
    
    await sgMail.send(msg);
  }

  async sendWelcomeEmail(user) {
    // Implementation
  }

  async sendPasswordReset(user, resetToken) {
    // Implementation
  }

  async sendBookingReminder(booking, user) {
    // Implementation
  }
}
```

### SMS Notifications (Africa's Talking)

```javascript
const AfricasTalking = require('africastalking');

const africastalking = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
});

const sms = africastalking.SMS;

async function sendSMS(phoneNumber, message) {
  const options = {
    to: [phoneNumber],
    message: message,
    from: 'KenyaUnfltrd'
  };

  try {
    const result = await sms.send(options);
    return result;
  } catch (error) {
    console.error('SMS Error:', error);
    throw error;
  }
}
```

---

## Security Considerations

### 1. Password Hashing
```javascript
const bcrypt = require('bcrypt');

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
```

### 2. Input Validation
```javascript
const { body, validationResult } = require('express-validator');

const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and number'),
  body('full_name').trim().isLength({ min: 2 }),
  body('phone').optional().isMobilePhone()
];

app.post('/api/auth/register', registerValidation, (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  // Process registration
});
```

### 3. Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use('/api/', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true
});

app.use('/api/auth/login', authLimiter);
```

### 4. CORS Configuration
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 5. SQL Injection Prevention
- Always use parameterized queries
- Use ORM (Prisma, Sequelize) with proper escaping
- Never concatenate user input into SQL queries

### 6. XSS Prevention
```javascript
const helmet = require('helmet');
const xss = require('xss-clean');

app.use(helmet());
app.use(xss());
```

---

## Deployment Guide

### Environment Variables (.env)
```bash
# Server
NODE_ENV=production
PORT=5000
API_URL=https://api.kenyaunfiltered.com
FRONTEND_URL=https://kenyaunfiltered.com

# Database
DATABASE_URL=postgresql://user:password@host:5432/kenya_unfiltered
REDIS_URL=redis://host:6379

# JWT
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRES_IN=7d

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_BUCKET_NAME=kenya-unfiltered-uploads

# M-Pesa
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_passkey
MPESA_CALLBACK_URL=https://api.kenyaunfiltered.com/api/payments/mpesa/callback

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# PayPal
PAYPAL_CLIENT_ID=your_client_id
PAYPAL_CLIENT_SECRET=your_client_secret

# SendGrid
SENDGRID_API_KEY=your_api_key

# Africa's Talking
AT_API_KEY=your_api_key
AT_USERNAME=your_username
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: kenya_unfiltered
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    restart: unless-stopped

volumes:
  postgres_data:
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.kenyaunfiltered.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.kenyaunfiltered.com;

    ssl_certificate /etc/letsencrypt/live/api.kenyaunfiltered.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.kenyaunfiltered.com/privkey.pem;

    location / {
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
}
```

---

## Testing

### Unit Tests Example (Jest)
```javascript
describe('User Authentication', () => {
  test('should register a new user', async () => {
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

  test('should not register with invalid email', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'invalid-email',
        password: 'SecurePass123!',
        full_name: 'Test User'
      });
    
    expect(response.status).toBe(400);
  });
});
```

---

## Additional Resources

- [M-Pesa Daraja API Documentation](https://developer.safaricom.co.ke/)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Socket.io Documentation](https://socket.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## Support

For questions or issues with backend integration:
- Email: dev@kenyaunfiltered.com
- Documentation: https://docs.kenyaunfiltered.com
- GitHub: https://github.com/kenyaunfiltered/backend

---

**Last Updated:** October 31, 2025
**Version:** 1.0.0
