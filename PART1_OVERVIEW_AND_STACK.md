# ELITE EVENTS KENYA - COMPLETE BACKEND SPECIFICATION
## Part 1: Overview & Technology Stack

---

## 🎯 PROJECT OVERVIEW

**Project Name**: Elite Events Kenya Backend API (Kenya Unfiltered)
**Purpose**: Production-ready RESTful API + WebSocket server for a tourism platform connecting international tourists with verified local Kenyan guides

**Core Features Required**:
1. User Authentication & Authorization (JWT-based)
2. Guide Profile Management & Applications
3. Experience/Tour Listings
4. Booking System with Calendar Management
5. Multi-Payment Gateway Integration (M-Pesa, Stripe, PayPal)
6. Real-time Messaging (Tourist ↔ Guide)
7. Review & Rating System
8. Admin Dashboard Backend
9. File Upload & Storage (Images, Videos, Documents)
10. Email & SMS Notifications
11. Search & Filtering
12. Analytics & Reporting

---

## 🛠️ TECHNOLOGY STACK (Node.js - RECOMMENDED)

### Core Framework
- **Runtime**: Node.js 18+ LTS
- **Framework**: Express.js 4.18+
- **Language**: JavaScript (ES6+) or TypeScript (preferred)

### Database Layer
- **Primary Database**: PostgreSQL 15+
  - Relational data (users, bookings, reviews)
  - Full-text search capabilities
  - JSONB support for flexible data
- **Cache/Session Store**: Redis 7+
  - Session management
  - Rate limiting
  - Real-time data caching
  - Queue management

### ORM & Database Tools
