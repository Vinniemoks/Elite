# Elite Events Kenya - Backend Documentation

## Project Overview
Elite Events Kenya (Kenya Unfiltered) is a tourism platform connecting international tourists with verified local Kenyan guides for authentic experiences at local rates.

## Technology Stack
- **Backend**: Node.js 18+ with Express.js
- **Database**: PostgreSQL 15+ (primary) + Redis 7+ (caching)
- **ORM**: Prisma
- **Authentication**: JWT + Passport.js
- **Real-time**: Socket.io for messaging
- **File Storage**: AWS S3
- **Payments**: M-Pesa (Daraja API), Stripe, PayPal
- **Email**: SendGrid
- **SMS**: Africa's Talking API
- **Documentation**: Swagger/OpenAPI 3.0

## Key Features

### 1. User Authentication & Authorization
- JWT-based authentication
- Role-based access control (Tourist, Guide, Admin)
- Email verification
- Password reset functionality
- Secure token refresh mechanism

### 2. Guide Application System
- Multi-step application form
- File uploads (resume, profile photo, video intro)
- Admin review process
- Application status tracking

### 3. Booking System
- Availability checking
- Reservation creation
- Booking confirmation
- Cancellation handling
- Reminder notifications

### 4. Multi-Payment Gateway
- M-Pesa integration (Safaricom Daraja API)
- Stripe integration (Payment Intents API)
- PayPal integration (Orders API)
- Payment status tracking
- Refund processing

### 5. Real-time Messaging
- Socket.io implementation
- Chat between tourists and guides
- Message persistence
- Read receipts
- Notification system

### 6. Admin Dashboard Backend
- User management
- Guide application review
- Booking oversight
- Content moderation
- Analytics endpoints

## Database Schema

### Core Tables (11 total):

1. **users** - User accounts and authentication
2. **guides** - Guide profiles and details
3. **guide_applications** - Guide application submissions
4. **experiences** - Tour/experience listings
5. **bookings** - Booking records
6. **payments** - Payment transactions
7. **reviews** - User reviews and ratings
8. **messages** - Chat messages
9. **availability_calendar** - Guide availability
10. **notifications** - System notifications
11. **audit_logs** - System activity logs

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user
- POST /api/auth/verify-email - Verify email
- POST /api/auth/forgot-password - Request password reset
- POST /api/auth/reset-password - Reset password
- POST /api/auth/refresh-token - Refresh JWT token
- POST /api/auth/logout - Logout user

### Users
- GET /api/users/me - Get current user profile
- PUT /api/users/me - Update user profile
- POST /api/users/me/upload-avatar - Upload avatar
- DELETE /api/users/me - Delete account

### Guides
- POST /api/guides/apply - Submit guide application
- GET /api/guides - List guides
- GET /api/guides/:id - Get guide details
- PUT /api/guides/:id - Update guide profile
- GET /api/guides/:id/availability - Get availability
- POST /api/guides/:id/availability - Set availability

### Experiences
- GET /api/experiences - List experiences
- GET /api/experiences/:id - Get experience details
- POST /api/experiences - Create experience
- PUT /api/experiences/:id - Update experience
- DELETE /api/experiences/:id - Delete experience

### Bookings
- POST /api/bookings - Create booking
- GET /api/bookings - List user bookings
- GET /api/bookings/:id - Get booking details
- PUT /api/bookings/:id/cancel - Cancel booking
- PUT /api/bookings/:id/confirm - Confirm booking
- PUT /api/bookings/:id/complete - Complete booking

### Payments
- POST /api/payments/mpesa/initiate - Initiate M-Pesa payment
- POST /api/payments/mpesa/callback - M-Pesa callback
- POST /api/payments/stripe/create-intent - Create Stripe payment intent
- POST /api/payments/stripe/webhook - Stripe webhook
- POST /api/payments/paypal/create-order - Create PayPal order
- POST /api/payments/paypal/capture-order - Capture PayPal order
- GET /api/payments/:id/status - Check payment status

### Reviews
- POST /api/reviews - Create review
- GET /api/reviews/guide/:guideId - Get guide reviews
- GET /api/reviews/experience/:experienceId - Get experience reviews
- PUT /api/reviews/:id/response - Add guide response
- PUT /api/reviews/:id/helpful - Mark review as helpful

### Messages
- GET /api/messages/conversations - Get conversations
- GET /api/messages/conversation/:userId - Get conversation
- POST /api/messages - Send message
- PUT /api/messages/:id/read - Mark message as read
- GET /api/messages/unread-count - Get unread count

### Admin
- GET /api/admin/applications - List applications
- GET /api/admin/applications/:id - Get application details
- PUT /api/admin/applications/:id/review - Review application
- GET /api/admin/users - List users
- PUT /api/admin/users/:id/suspend - Suspend/unsuspend user
- GET /api/admin/bookings - List bookings
- GET /api/admin/analytics - Get analytics

## Security Requirements
- Secure JWT implementation
- CSRF protection
- Role-based access control
- Input validation
- Rate limiting
- Secure headers (helmet.js)
- CORS configuration
- PCI compliance for payments

## Integration Requirements

### M-Pesa Integration
- Safaricom Daraja API for STK Push, C2B, B2C
- Secure callback handling

### Stripe Integration
- Payment Intents API for card payments
- 3D Secure support
- Webhook handling

### PayPal Integration
- Orders API for express checkout
- Order capture flow

### Email & SMS
- SendGrid for transactional emails
- Africa's Talking for SMS notifications

## Testing Requirements
- Unit tests for controllers, services, models
- Integration tests for API endpoints
- End-to-end tests for critical flows
- Minimum 80% test coverage

## Deployment Requirements
- Docker containerization
- CI/CD pipeline with GitHub Actions
- Environment configuration (dev/staging/prod)
- Monitoring and error tracking
- Health checks and logging

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
- Project setup and configuration
- Database schema implementation
- Authentication system
- Core API structure

### Phase 2: Core Features (Weeks 3-4)
- Guide application system
- Experience/tour management
- Booking system
- Payment integrations

### Phase 3: Enhanced Features (Weeks 5-6)
- Messaging system
- Review system
- Search functionality
- Email/SMS notifications

### Phase 4: Admin & Finalization (Weeks 7-8)
- Admin dashboard endpoints
- Analytics
- Testing & optimization
- Documentation & deployment

## Quality Assurance Checklist
- All API endpoints functional
- Database schema properly implemented
- Authentication system secure
- Payment gateways integrated and tested
- File uploads working correctly
- Real-time messaging functional
- Email/SMS notifications sending
- Admin features complete
- API documentation complete
- Tests passing with >80% coverage
- Performance requirements met
- Security measures implemented
- Deployment documentation complete