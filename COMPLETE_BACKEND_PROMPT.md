# 🚀 ELITE EVENTS KENYA - COMPLETE BACKEND RECREATION GUIDE

## 📋 EXECUTIVE SUMMARY
Build a production-ready Node.js/Express backend API for **Elite Events Kenya** (Kenya Unfiltered) - a tourism platform connecting international tourists with verified local Kenyan guides for authentic experiences.

**Repository Structure**: Standalone backend repository (separate from frontend)
**Deployment Target**: Cloud hosting (AWS/DigitalOcean/Heroku)
**API Type**: RESTful API + WebSocket (Socket.io)

---

## 🎯 CORE FEATURES TO IMPLEMENT

### 1. Authentication & User Management
- User registration (tourist/guide/admin roles)
- Email/password login with JWT tokens
- Email verification with tokens
- Phone verification (SMS OTP via Africa's Talking)
- Password reset flow
- OAuth integration (Google, Facebook - optional)
- Session management with Redis
- Role-based access control (RBAC)

### 2. Guide Application System
- Multi-part form submission
- File uploads (resume: PDF/DOC, video: MP4/WEBM)
- Application status tracking (pending/approved/rejected)
- Admin review interface
- Background verification workflow
- Automated email notifications

### 3. Guide Profile Management
- Public profile pages
- Specializations & regions
- Availability calendar
- Pricing (hourly/daily rates)
- Photo gallery
- Languages spoken
- Certifications & badges

### 4. Experience/Tour Listings
- Create/edit/delete experiences
- Categories (nightlife, cultural, adventure, food, nature)
- Pricing & duration
- Max group size
- Included/excluded items
- Meeting points
- Image galleries
- Status management (active/inactive/draft)

### 5. Booking System
- Create booking requests
- Date/time selection with availability checking
- Guest count management
- Special requests field
- Booking status workflow (pending→confirmed→completed→cancelled)
- Cancellation policy enforcement
- Booking history for tourists & guides
- Calendar integration
- Automated reminders (24h before, day-of)

### 6. Payment Processing
**M-Pesa Integration** (Primary for Kenyan users):
- STK Push (Lipa Na M-Pesa Online)
- Payment confirmation callbacks
- Transaction status checking
- Refund processing

**Stripe Integration** (International cards):
- Payment Intents API
- 3D Secure support
- Webhook handling
- Refund API

**PayPal Integration** (Alternative):
- Orders API
- Payment capture
- Webhook events
- Refund processing

**Payment Features**:
- Multi-currency support (USD, KES)
- Service fee calculation (10%)
- Split payments (platform fee + guide payout)
- Payment history & receipts
- Automated payout scheduling

### 7. Real-time Messaging
- Socket.io WebSocket server
- One-on-one chat (tourist ↔ guide)
- Message persistence in database
- Typing indicators
- Read receipts
- File attachments
- Push notifications for new messages
- Conversation history
- Unread message counts

### 8. Review & Rating System
- 5-star rating system
- Text reviews with photos
- Review moderation (pending/approved/rejected)
- Guide response to reviews
- Helpful vote system
- Average rating calculation
- Review filtering & sorting
- Verified booking requirement

### 9. Search & Discovery
- Full-text search (guides, experiences)
- Filter by: region, category, price range, rating, availability
- Sort by: rating, price, popularity, newest
- Pagination support
- Search suggestions/autocomplete
- Geolocation-based search

### 10. Admin Dashboard Backend
- User management (view, suspend, delete)
- Guide application review
- Booking oversight
- Payment transaction monitoring
- Review moderation
- Analytics endpoints
- System health monitoring
- Audit logs

### 11. Notifications
**Email Notifications** (SendGrid/AWS SES):
- Welcome emails
- Email verification
- Booking confirmations
- Payment receipts
- Booking reminders
- Review requests
- Password reset
- Application status updates

**SMS Notifications** (Africa's Talking):
- Phone verification OTP
- Booking confirmations
- Payment confirmations
- Urgent updates

**Push Notifications** (Optional - Firebase):
- New messages
- Booking updates
- Payment confirmations

### 12. File Management
- AWS S3 or Cloudinary integration
- Image upload & optimization
- Video upload (guide applications)
- Document upload (resumes, certifications)
- File size limits & validation
- Secure signed URLs
- Automatic thumbnail generation

---

## 🗄️ DATABASE SCHEMA (PostgreSQL)

### Core Tables Required:

**1. users**
- id (UUID, PK)
- email (unique, indexed)
- password_hash
- full_name
- phone
- user_type (tourist/guide/admin)
- profile_image
- nationality
- languages (array)
- verified, email_verified, phone_verified (booleans)
- created_at, updated_at, last_login
- status (active/suspended/deleted)

**2. guides**
- id (UUID, PK)
- user_id (FK → users, unique)
- bio (text)
- specializations (array)
- regions (array)
- years_experience
- hourly_rate_usd, daily_rate_usd
- availability_status (available/busy/offline)
- rating (decimal)
- total_reviews, total_bookings
- verification_documents (JSONB)
- certifications (array)
- social_links (JSONB)

**3. guide_applications**
- id (UUID, PK)
- full_name, email, phone
- location, languages
- experience_years
- bio
- social_emails, social_links (JSONB)
- resume_url, video_url
- status (pending/approved/rejected)
- reviewed_by (FK → users)
- review_notes
- submitted_at, reviewed_at

**4. experiences**
- id (UUID, PK)
- guide_id (FK → guides)
- title, description
- category (nightlife/cultural/adventure/food/nature)
- duration_hours
- price_usd
- max_guests
- location, meeting_point
- included_items, excluded_items (arrays)
- requirements (text)
- images (array)
- status (active/inactive/draft)
- rating, total_bookings
- created_at, updated_at

**5. bookings**
- id (UUID, PK)
- tourist_id (FK → users)
- guide_id (FK → guides)
- experience_id (FK → experiences, nullable)
- booking_date, booking_time
- number_of_guests
- total_price_usd, service_fee_usd
- currency, exchange_rate
- special_requests
- status (pending/confirmed/completed/cancelled/refunded)
- payment_status (pending/paid/refunded)
- payment_method, payment_id
- cancellation_reason, cancelled_by, cancelled_at
- created_at, updated_at

**6. payments**
- id (UUID, PK)
- booking_id (FK → bookings)
- user_id (FK → users)
- amount_usd, amount_local, currency
- payment_method (mpesa/card/paypal)
- payment_provider
- transaction_id (unique)
- status (pending/completed/failed/refunded)
- provider_response (JSONB)
- created_at, updated_at

**7. reviews**
- id (UUID, PK)
- booking_id (FK → bookings, unique)
- tourist_id (FK → users)
- guide_id (FK → guides)
- experience_id (FK → experiences, nullable)
- rating (1-5)
- comment (text)
- images (array)
- response (text) -- guide's response
- response_date
- helpful_count
- status (pending/approved/rejected)
- created_at, updated_at

**8. messages**
- id (UUID, PK)
- sender_id (FK → users)
- receiver_id (FK → users)
- booking_id (FK → bookings, nullable)
- message (text)
- attachments (array)
- read (boolean)
- read_at
- created_at

**9. availability_calendar**
