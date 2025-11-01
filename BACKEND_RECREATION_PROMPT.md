# COMPREHENSIVE BACKEND RECREATION PROMPT FOR ELITE EVENTS KENYA (KENYA UNFILTERED)

## PROJECT OVERVIEW

Create a complete, production-ready backend API for **Elite Events Kenya** (also known as Kenya Unfiltered), a platform connecting international tourists with verified local Kenyan guides for authentic cultural experiences. The backend must support user authentication, booking management, payment processing (M-Pesa, Stripe, PayPal), real-time messaging, guide applications, reviews, and admin functionality.

---

## TECHNOLOGY STACK REQUIREMENTS

### Primary Stack (Node.js - RECOMMENDED)
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 15+ (primary) + Redis 7+ (caching, sessions)
- **ORM**: Prisma 5.x (preferred) or Sequelize 6.x
- **Authentication**: JWT (jsonwebtoken) + Passport.js
- **Real-time**: Socket.io 4.x
- **File Storage**: AWS S3 SDK or Cloudinary
- **Email**: SendGrid or AWS SES
- **SMS**: Africa's Talking API
- **Payment Gateways**: 
  - M-Pesa Daraja API (Safaricom)
  - Stripe SDK
  - PayPal SDK
- **Validation**: express-validator or Joi
- **Security**: helmet, cors, express-rate-limit, bcrypt
- **Testing**: Jest + Supertest
- **Documentation**: Swagger/OpenAPI 3.0

### Alternative Stacks (Optional)

**Python/Django**: Django 4.x + Django REST Framework + Celery + Django Channels
**PHP/Laravel**: Laravel 10.x + Laravel Sanctum + Laravel Echo + Pusher

---

## DATABASE SCHEMA (PostgreSQL)

### 1. Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('tourist', 'guide', 'admin')),
    profile_image VARCHAR(500),
    nationality VARCHAR(100),
    languages TEXT[],
    verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_status ON users(status);
```

### 2. Guides Table
```sql
CREATE TABLE guides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    bio TEXT,
    specializations TEXT[],
    regions TEXT[],
    years_experience INTEGER,
    hourly_rate_usd DECIMAL(10, 2),
    availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'busy', 'offline')),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    total_reviews INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0,
