# API ENDPOINTS SPECIFICATION

## 🔐 AUTHENTICATION ENDPOINTS

### POST /api/auth/register
**Purpose**: Register new user (tourist or guide)
**Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe",
  "phone": "+254700000000",
  "user_type": "tourist",
  "nationality": "USA"
}
```
**Response (201)**:
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": { "id": "uuid", "email": "...", "full_name": "...", "user_type": "tourist" },
    "token": "jwt_token_here"
  }
}
```
**Validation**: Email format, password strength (min 8 chars, uppercase, number), required fields

### POST /api/auth/login
**Body**: `{ "email": "...", "password": "..." }`
**Response (200)**: User object + JWT token
**Rate Limit**: 5 attempts per 15 minutes per IP

### POST /api/auth/verify-email
**Body**: `{ "token": "verification_token" }`
**Response**: Success message

### POST /api/auth/forgot-password
**Body**: `{ "email": "..." }`
**Action**: Send password reset email with token

### POST /api/auth/reset-password
**Body**: `{ "token": "...", "new_password": "..." }`

### POST /api/auth/refresh-token
**Headers**: `Authorization: Bearer <refresh_token>`
**Response**: New access token

### POST /api/auth/logout
**Headers**: `Authorization: Bearer <token>`
**Action**: Invalidate token (add to Redis blacklist)

---

## 👤 USER ENDPOINTS

### GET /api/users/me
**Auth**: Required
**Response**: Current user profile

### PUT /api/users/me
**Auth**: Required
**Body**: Updatable fields (full_name, phone, profile_image, etc.)

### POST /api/users/me/upload-avatar
**Auth**: Required
**Body**: multipart/form-data with image file
**Response**: New profile_image URL

### DELETE /api/users/me
**Auth**: Required
**Action**: Soft delete (set status='deleted')

---

## 🎯 GUIDE ENDPOINTS

### POST /api/guides/apply
**Purpose**: Submit guide application
**Body**: multipart/form-data
**Fields**:
- fullName, email, phone, location, languages
- experienceYears, bio
- socialEmails, facebook, instagram, twitter, tiktok, youtube
- resume (file, required, max 5MB, PDF/DOC/DOCX)
- video (file, optional, max 50MB, MP4/WEBM)
**Response (201)**: Application ID and confirmation

### GET /api/guides
**Purpose**: List all approved guides
**Query Params**:
- page, limit (pagination)
- region, specialization (filters)
- min_rating, max_price
- sort_by (rating/price/reviews)
- search (text search)
**Response**: Paginated guide list

### GET /api/guides/:id
**Purpose**: Get single guide profile
**Response**: Full guide details + experiences + reviews

### PUT /api/guides/:id
**Auth**: Required (guide owner or admin)
**Body**: Updatable guide fields

### GET /api/guides/:id/availability
**Purpose**: Get guide's availability calendar
**Query**: ?month=2025-11&year=2025
**Response**: Available/blocked dates

### POST /api/guides/:id/availability
**Auth**: Required (guide owner)
**Body**: `{ "date": "2025-11-15", "available": false }`

---

## 🎪 EXPERIENCE ENDPOINTS

### GET /api/experiences
**Query Params**: category, location, min_price, max_price, duration, rating, page, limit
**Response**: Paginated experience list

### GET /api/experiences/:id
**Response**: Full experience details

### POST /api/experiences
**Auth**: Required (guide only)
**Body**:
```json
{
  "title": "Nairobi After Dark",
  "description": "...",
  "category": "nightlife",
  "duration_hours": 5,
  "price_usd": 17,
  "max_guests": 6,
  "location": "Nairobi",
  "meeting_point": "...",
  "included_items": ["..."],
  "excluded_items": ["..."],
  "images": ["url1", "url2"]
}
```

### PUT /api/experiences/:id
**Auth**: Required (guide owner)

### DELETE /api/experiences/:id
**Auth**: Required (guide owner)

---

## 📅 BOOKING ENDPOINTS

### POST /api/bookings
**Auth**: Required (tourist)
**Body**:
```json
{
  "experience_id": "uuid",
  "guide_id": "uuid",
  "booking_date": "2025-11-15",
  "booking_time": "14:00",
  "number_of_guests": 2,
  "special_requests": "...",
  "payment_method": "mpesa"
}
```
**Response**: Booking object + payment_url

### GET /api/bookings
**Auth**: Required
**Response**: User's bookings (tourist sees their bookings, guide sees bookings for them)

### GET /api/bookings/:id
**Auth**: Required
**Response**: Booking details

### PUT /api/bookings/:id/cancel
**Auth**: Required
**Body**: `{ "cancellation_reason": "..." }`

### PUT /api/bookings/:id/confirm
**Auth**: Required (guide only)

### PUT /api/bookings/:id/complete
**Auth**: Required (guide only)

---

## 💳 PAYMENT ENDPOINTS

### POST /api/payments/mpesa/initiate
**Body**: `{ "booking_id": "...", "phone_number": "+254..." }`
**Response**: STK Push initiated

### POST /api/payments/mpesa/callback
**Purpose**: M-Pesa callback handler (webhook)
**Body**: M-Pesa result payload

### POST /api/payments/stripe/create-intent
**Body**: `{ "booking_id": "..." }`
**Response**: `{ "client_secret": "..." }`

### POST /api/payments/stripe/webhook
**Purpose**: Stripe webhook handler

### POST /api/payments/paypal/create-order
**Body**: `{ "booking_id": "..." }`
**Response**: PayPal order ID

### POST /api/payments/paypal/capture-order
**Body**: `{ "order_id": "..." }`

### GET /api/payments/:id/status
**Auth**: Required
**Response**: Payment status

---

## ⭐ REVIEW ENDPOINTS

### POST /api/reviews
**Auth**: Required (tourist, must have completed booking)
**Body**:
```json
{
  "booking_id": "uuid",
  "rating": 5,
  "comment": "Amazing experience!",
  "images": ["url1", "url2"]
}
```

### GET /api/reviews/guide/:guideId
**Query**: page, limit, sort_by
**Response**: Paginated reviews

### GET /api/reviews/experience/:experienceId
**Response**: Paginated reviews

### PUT /api/reviews/:id/response
**Auth**: Required (guide only)
**Body**: `{ "response": "Thank you for the feedback!" }`

### PUT /api/reviews/:id/helpful
**Auth**: Required
**Action**: Increment helpful_count

---

## 💬 MESSAGE ENDPOINTS

### GET /api/messages/conversations
**Auth**: Required
**Response**: List of conversations with last message

### GET /api/messages/conversation/:userId
**Auth**: Required
**Query**: page, limit
**Response**: Messages between current user and specified user

### POST /api/messages
**Auth**: Required
**Body**: `{ "receiver_id": "...", "message": "...", "booking_id": "..." }`

### PUT /api/messages/:id/read
**Auth**: Required

### GET /api/messages/unread-count
**Auth**: Required
**Response**: `{ "count": 5 }`

---

## 🔍 SEARCH ENDPOINT

### GET /api/search
**Query**: q (search term), category, type (guides/experiences/all), page, limit
**Response**: Combined search results

---

## 👨‍💼 ADMIN ENDPOINTS

### GET /api/admin/applications
**Auth**: Required (admin only)
**Response**: List of guide applications

### GET /api/admin/applications/:id
**Auth**: Required (admin)
**Response**: Application details

### PUT /api/admin/applications/:id/review
**Auth**: Required (admin)
**Body**: `{ "status": "approved", "review_notes": "..." }`

### GET /api/admin/users
**Auth**: Required (admin)
**Query**: user_type, status, page, limit
**Response**: User list

### PUT /api/admin/users/:id/suspend
**Auth**: Required (admin)

### GET /api/admin/bookings
**Auth**: Required (admin)
**Response**: All bookings

### GET /api/admin/payments
**Auth**: Required (admin)
**Response**: Payment transactions

### GET /api/admin/analytics
**Auth**: Required (admin)
**Response**: Platform statistics

---

## 📤 FILE UPLOAD ENDPOINTS

### POST /api/upload/image
**Auth**: Required
**Body**: multipart/form-data
**Response**: `{ "url": "https://..." }`

### POST /api/upload/video
**Auth**: Required
**Body**: multipart/form-data
**Response**: `{ "url": "https://..." }`

### POST /api/upload/document
**Auth**: Required
**Body**: multipart/form-data
**Response**: `{ "url": "https://..." }`
