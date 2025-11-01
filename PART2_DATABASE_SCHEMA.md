# ELITE EVENTS KENYA - COMPLETE BACKEND SPECIFICATION
## Part 2: Complete Database Schema

---

## 📊 POSTGRESQL DATABASE SCHEMA

### Table 1: users
**Purpose**: Store all user accounts (tourists, guides, admins)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('tourist', 'guide', 'admin')),
    profile_image VARCHAR(500),
    nationality VARCHAR(100),
    languages TEXT[], -- Array: ['English', 'Swahili', 'French']
    date_of_birth DATE,
    gender VARCHAR(20),
    verified BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    phone_verified BOOLEAN DEFAULT FALSE,
    phone_verification_code VARCHAR(10),
    phone_verification_expires TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'deleted', 'pending'))
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_verified ON users(verified);
```

### Table 2: guides
**Purpose**: Extended profile information for guide users

```sql
CREATE TABLE guides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    bio TEXT,
    specializations TEXT[], -- ['nightlife', 'cultural', 'adventure', 'food']
    regions TEXT[], -- ['Nairobi', 'Mombasa', 'Rift Valley']
    years_experience INTEGER,
    hourly_rate_usd DECIMAL(10, 2),
    daily_rate_usd DECIMAL(10, 2),
