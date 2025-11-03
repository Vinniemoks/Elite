# 🚀 ELITE EVENTS KENYA (KENYA UNFILTERED) - BACKEND CREATION PROMPT

## 📋 PROJECT OVERVIEW

Create a production-ready backend API for **Elite Events Kenya** (Kenya Unfiltered), a tourism platform connecting international tourists with verified local Kenyan guides for authentic experiences at local rates. The backend will support user authentication, guide applications, booking management, multi-currency payments, real-time messaging, and admin functionality.

### Repository Structure
- Standalone backend repository (separate from frontend)
- RESTful API + WebSocket (Socket.io) for real-time features

## 💻 TECHNOLOGY STACK

### Core Technologies
- **Backend**: Node.js 18+ with Express.js
- **Database**: PostgreSQL 15+ (primary) + Redis 7+ (caching)
- **ORM**: Prisma (recommended) or Sequelize
- **Authentication**: JWT + Passport.js
- **Real-time**: Socket.io for messaging
- **File Storage**: AWS S3 or Cloudinary
- **Payments**: M-Pesa (Daraja API), Stripe, PayPal
- **Email**: SendGrid or AWS SES
- **SMS**: Africa's Talking API
- **Documentation**: Swagger/OpenAPI 3.0

## 🔑 KEY FEATURES

1. **User Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (Tourist, Guide, Admin)
   - Email verification
   - Password reset functionality
   - Social login (optional)

2. **Guide Application System**
   - Multi-step application form
   - File uploads (resume, profile photo, video intro)
   - Admin review process
   - Application status tracking

3. **Guide Profile Management**
   - Profile creation and editing
   - Availability calendar
   - Experience/tour creation
   - Booking management

4. **Experience/Tour Listings**
   - CRUD operations for experiences
   - Media uploads
   - Pricing (USD/KES)
   - Availability settings
   - Categories and tags

5. **Booking System**
   - Availability checking
   - Reservation creation
   - Booking confirmation
   - Cancellation handling
   - Reminder notifications

6. **Multi-Payment Gateway**
   - M-Pesa integration (Safaricom Daraja API)
   - Stripe integration (Payment Intents API)
   - PayPal integration (Orders API)
   - Payment status tracking
   - Refund processing

7. **Real-time Messaging**
   - Socket.io implementation
   - Chat between tourists and guides
   - Message persistence
   - Read receipts
   - Notification system

8. **Review & Rating System**
   - Post-experience reviews
   - Star ratings
   - Guide responses
   - Helpful votes

9. **Admin Dashboard Backend**
   - User management
   - Guide application review
   - Booking oversight
   - Content moderation
   - Analytics endpoints

10. **Search & Filtering**
    - Full-text search
    - Filter by location, price, rating
    - Sort by relevance, price, popularity
    - Pagination

11. **Email & SMS Notifications**
    - Transactional emails
    - Booking confirmations
    - Reminders
    - SMS notifications for critical updates

12. **File Upload & Storage**
    - Secure file uploads
    - Image optimization
    - Video processing
    - CDN integration

## 📊 DATABASE SCHEMA

### Core Tables (11 total):
1. **users** - All user accounts (tourists, guides, admins)
2. **guides** - Extended guide profiles
3. **guide_applications** - Guide application submissions
4. **experiences** - Tour/experience listings
5. **bookings** - Booking records
6. **payments** - Payment transactions
7. **reviews** - User reviews and ratings
8. **messages** - Real-time chat messages
9. **availability_calendar** - Guide availability
10. **notifications** - System notifications
11. **audit_logs** - Admin audit trail

## 🔌 API ENDPOINTS

### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/verify-email
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- POST /api/auth/refresh-token
- POST /api/auth/logout

### Users
- GET /api/users/me
- PUT /api/users/me
- POST /api/users/me/upload-avatar
- DELETE /api/users/me

### Guides
- POST /api/guides/apply
- GET /api/guides
- GET /api/guides/:id
- PUT /api/guides/:id
- GET /api/guides/:id/availability
- POST /api/guides/:id/availability

### Experiences
- GET /api/experiences
- GET /api/experiences/:id
- POST /api/experiences
- PUT /api/experiences/:id
- DELETE /api/experiences/:id

### Bookings
- POST /api/bookings
- GET /api/bookings
- GET /api/bookings/:id
- PUT /api/bookings/:id/cancel
- PUT /api/bookings/:id/confirm
- PUT /api/bookings/:id/complete

### Payments
- POST /api/payments/mpesa/initiate
- POST /api/payments/mpesa/callback
- POST /api/payments/stripe/create-intent
- POST /api/payments/stripe/webhook
- POST /api/payments/paypal/create-order
- POST /api/payments/paypal/capture-order
- GET /api/payments/:id/status

### Reviews
- POST /api/reviews
- GET /api/reviews/guide/:guideId
- GET /api/reviews/experience/:experienceId
- PUT /api/reviews/:id/response
- PUT /api/reviews/:id/helpful

### Messages
- GET /api/messages/conversations
- GET /api/messages/conversation/:userId
- POST /api/messages
- PUT /api/messages/:id/read
- GET /api/messages/unread-count

### Search
- GET /api/search

### Admin
- GET /api/admin/applications
- GET /api/admin/applications/:id
- PUT /api/admin/applications/:id/review
- GET /api/admin/users
- PUT /api/admin/users/:id/suspend
- GET /api/admin/bookings
- GET /api/admin/analytics

### Uploads
- POST /api/upload/image
- POST /api/upload/video
- POST /api/upload/document

**Total: 62+ API endpoints**

## 🔐 SECURITY REQUIREMENTS

1. **Authentication & Authorization**
   - Secure JWT implementation
   - CSRF protection
   - Role-based access control

2. **Data Protection**
   - Input validation
   - SQL injection prevention
   - XSS protection
   - Parameter pollution protection

3. **API Security**
   - Rate limiting
   - Request size limiting
   - Secure headers
   - CORS configuration

4. **Sensitive Data**
   - Encryption at rest
   - Secure environment variables
   - PCI compliance for payments

## 📱 INTEGRATION REQUIREMENTS

### M-Pesa Integration
- **API**: Safaricom Daraja API
- **Features**: STK Push, C2B, B2C
- **Documentation**: https://developer.safaricom.co.ke/

### Stripe Integration
- **API**: Stripe Payment Intents
- **Features**: Card payments, 3D Secure
- **Documentation**: https://stripe.com/docs/api

### PayPal Integration
- **API**: PayPal Orders API
- **Features**: Express checkout
- **Documentation**: https://developer.paypal.com/docs/api/orders/v2/

### Email Integration
- **Provider**: SendGrid or AWS SES
- **Features**: Transactional emails, templates
- **Documentation**: https://sendgrid.com/docs/api-reference/

### SMS Integration
- **Provider**: Africa's Talking
- **Features**: SMS notifications
- **Documentation**: https://developers.africastalking.com/docs

## 🧪 TESTING REQUIREMENTS

1. **Unit Tests**
   - Controllers
   - Services
   - Models
   - Utilities

2. **Integration Tests**
   - API endpoints
   - Database operations
   - External service integrations

3. **End-to-End Tests**
   - Critical user flows
   - Payment processes

4. **Test Coverage**
   - Minimum 80% coverage

## 📦 DEPLOYMENT REQUIREMENTS

1. **Environment Setup**
   - Development
   - Staging
   - Production

2. **Containerization**
   - Docker
   - Docker Compose

3. **CI/CD**
   - GitHub Actions or similar
   - Automated testing
   - Deployment pipelines

4. **Monitoring**
   - Error tracking
   - Performance monitoring
   - Health checks

## 📝 DOCUMENTATION REQUIREMENTS

1. **API Documentation**
   - Swagger/OpenAPI 3.0
   - Endpoint descriptions
   - Request/response examples

2. **Setup Documentation**
   - Installation guide
   - Environment variables
   - Development workflow

3. **Deployment Documentation**
   - Server requirements
   - Deployment steps
   - Troubleshooting guide

## ⚙️ PERFORMANCE REQUIREMENTS

1. **Response Times**
   - < 200ms API response time (95th percentile)
   - < 500ms for complex operations

2. **Scalability**
   - Horizontal scaling capability
   - Connection pooling
   - Efficient database queries

3. **Caching**
   - Redis implementation
   - Cache invalidation strategy
   - Response caching

## 🚀 IMPLEMENTATION ROADMAP

### Phase 1: Foundation
1. Project setup and configuration
2. Database schema implementation
3. Authentication system
4. Core API structure

### Phase 2: Core Features
1. Guide application system
2. Experience/tour management
3. Booking system
4. Payment integrations

### Phase 3: Enhanced Features
1. Messaging system
2. Review system
3. Search functionality
4. Email/SMS notifications

### Phase 4: Admin & Finalization
1. Admin dashboard endpoints
2. Analytics
3. Testing & optimization
4. Documentation & deployment

## 🔍 QUALITY ASSURANCE CHECKLIST

- [ ] All 62+ API endpoints functional
- [ ] Database schema properly implemented
- [ ] Authentication system secure
- [ ] Payment gateways integrated and tested
- [ ] File uploads working correctly
- [ ] Real-time messaging functional
- [ ] Email/SMS notifications sending
- [ ] Admin features complete
- [ ] API documentation complete
- [ ] Tests passing with >80% coverage
- [ ] Performance requirements met
- [ ] Security measures implemented
- [ ] Deployment documentation complete

## 🌟 CONCLUSION

This comprehensive guide provides everything needed to create the Elite Events Kenya backend from scratch. The backend is designed to be:

1. **Scalable** - Handles growing user base and traffic
2. **Secure** - Implements best security practices
3. **Maintainable** - Well-structured and documented
4. **Performant** - Fast response times and efficient operations
5. **Reliable** - Robust error handling and logging

Follow the implementation roadmap and quality assurance checklist to ensure all requirements are met. The resulting backend will provide a solid foundation for the Elite Events Kenya platform, enabling seamless connections between international tourists and local Kenyan guides.

**Good luck with your backend development! 🚀**