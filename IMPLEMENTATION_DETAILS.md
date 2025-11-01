# IMPLEMENTATION DETAILS & CODE EXAMPLES

## 🔧 PROJECT STRUCTURE

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js          # PostgreSQL connection
│   │   ├── redis.js             # Redis connection
│   │   ├── aws-s3.js            # S3 configuration
│   │   ├── email.js             # SendGrid/SES config
│   │   ├── sms.js               # Africa's Talking config
│   │   └── payments/
│   │       ├── mpesa.js
│   │       ├── stripe.js
│   │       └── paypal.js
│   ├── models/                  # Database models (Prisma/Sequelize)
│   │   ├── User.js
│   │   ├── Guide.js
│   │   ├── Experience.js
│   │   ├── Booking.js
│   │   ├── Payment.js
│   │   ├── Review.js
│   │   └── Message.js
│   ├── controllers/             # Route handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── guideController.js
│   │   ├── experienceController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   ├── reviewController.js
│   │   ├── messageController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js              # JWT verification
│   │   ├── roleCheck.js         # RBAC middleware
│   │   ├── validation.js        # Request validation
│   │   ├── errorHandler.js      # Global error handler
│   │   ├── rateLimiter.js       # Rate limiting
│   │   └── upload.js            # Multer configuration
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── guides.js
│   │   ├── experiences.js
│   │   ├── bookings.js
│   │   ├── payments.js
│   │   ├── reviews.js
│   │   ├── messages.js
│   │   ├── search.js
│   │   └── admin.js
│   ├── services/
│   │   ├── emailService.js
│   │   ├── smsService.js
│   │   ├── uploadService.js
│   │   ├── paymentService.js
│   │   └── notificationService.js
│   ├── utils/
│   │   ├── jwt.js
│   │   ├── bcrypt.js
│   │   ├── validators.js
│   │   └── helpers.js
│   ├── socket/
│   │   └── messageHandler.js    # Socket.io handlers
│   └── server.js                # Main entry point
├── prisma/
│   └── schema.prisma            # Prisma schema
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── docker-compose.yml
```

---

## 🔐 AUTHENTICATION IMPLEMENTATION

### JWT Token Generation (src/utils/jwt.js)
```javascript
const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      user_id: user.id,
      email: user.email,
      user_type: user.user_type
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    { user_id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

module.exports = { generateAccessToken, generateRefreshToken, verifyToken };
```

### Auth Middleware (src/middleware/auth.js)
```javascript
const { verifyToken } = require('../utils/jwt');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
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

const adminOnly = (req, res, next) => {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

module.exports = { authMiddleware, guideOnly, adminOnly };
```

---

## 💳 M-PESA INTEGRATION

### M-Pesa Service (src/services/paymentService.js)
```javascript
const axios = require('axios');

class MPesaService {
  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    this.shortcode = process.env.MPESA_SHORTCODE;
    this.passkey = process.env.MPESA_PASSKEY;
    this.callbackUrl = process.env.MPESA_CALLBACK_URL;
    this.baseUrl = process.env.MPESA_ENV === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
  }

  async getAccessToken() {
    const auth = Buffer.from(
      `${this.consumerKey}:${this.consumerSecret}`
    ).toString('base64');
    
    const response = await axios.get(
      `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${auth}` }
      }
    );
    
    return response.data.access_token;
  }

  async initiateSTKPush(phoneNumber, amount, accountReference, description) {
    const token = await this.getAccessToken();
    const timestamp = new Date().toISOString()
      .replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(
      `${this.shortcode}${this.passkey}${timestamp}`
    ).toString('base64');

    const response = await axios.post(
      `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.round(amount),
        PartyA: phoneNumber,
        PartyB: this.shortcode,
        PhoneNumber: phoneNumber,
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: description
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    return response.data;
  }

  async handleCallback(callbackData) {
    // Process M-Pesa callback
    const { Body } = callbackData;
    const { stkCallback } = Body;
    
    if (stkCallback.ResultCode === 0) {
      // Payment successful
      const items = stkCallback.CallbackMetadata.Item;
      const transactionId = items.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
      const amount = items.find(i => i.Name === 'Amount')?.Value;
      
      return {
        success: true,
        transactionId,
        amount
      };
    } else {
      // Payment failed
      return {
        success: false,
        message: stkCallback.ResultDesc
      };
    }
  }
}

module.exports = new MPesaService();
```

---

## 📧 EMAIL SERVICE

### Email Service (src/services/emailService.js)
```javascript
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class EmailService {
  async sendWelcomeEmail(user) {
    const msg = {
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject: 'Welcome to Elite Events Kenya!',
      html: `
        <h1>Welcome ${user.full_name}!</h1>
        <p>Thank you for joining Elite Events Kenya.</p>
        <p>Start exploring authentic Kenyan experiences today!</p>
      `
    };
    
    await sgMail.send(msg);
  }

  async sendEmailVerification(user, token) {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const msg = {
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject: 'Verify Your Email',
      html: `
        <h1>Email Verification</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>This link expires in 24 hours.</p>
      `
    };
    
    await sgMail.send(msg);
  }

  async sendBookingConfirmation(booking, user, guide) {
    const msg = {
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject: 'Booking Confirmed - Elite Events Kenya',
      html: `
        <h1>Booking Confirmed!</h1>
        <p>Dear ${user.full_name},</p>
        <p>Your booking has been confirmed.</p>
        <h3>Booking Details:</h3>
        <ul>
          <li>Booking ID: ${booking.id}</li>
          <li>Date: ${booking.booking_date}</li>
          <li>Time: ${booking.booking_time}</li>
          <li>Guide: ${guide.full_name}</li>
          <li>Total: $${booking.total_price_usd}</li>
        </ul>
        <p>Your guide will contact you shortly.</p>
      `
    };
    
    await sgMail.send(msg);
  }

  async sendPasswordReset(user, token) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const msg = {
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject: 'Password Reset Request',
      html: `
        <h1>Password Reset</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };
    
    await sgMail.send(msg);
  }
}

module.exports = new EmailService();
```

---

## 📱 SMS SERVICE

### SMS Service (src/services/smsService.js)
```javascript
const AfricasTalking = require('africastalking');

const africastalking = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
});

const sms = africastalking.SMS;

class SMSService {
  async sendOTP(phoneNumber, code) {
    const message = `Your Elite Events Kenya verification code is: ${code}. Valid for 10 minutes.`;
    
    try {
      const result = await sms.send({
        to: [phoneNumber],
        message: message,
        from: process.env.AT_SENDER_ID || 'EliteEvents'
      });
      
      return result;
    } catch (error) {
      console.error('SMS Error:', error);
      throw error;
    }
  }

  async sendBookingConfirmation(phoneNumber, bookingId, date) {
    const message = `Booking ${bookingId} confirmed for ${date}. Check your email for details.`;
    
    await sms.send({
      to: [phoneNumber],
      message: message,
      from: process.env.AT_SENDER_ID || 'EliteEvents'
    });
  }
}

module.exports = new SMSService();
```

---

## 🔌 SOCKET.IO IMPLEMENTATION

### Message Handler (src/socket/messageHandler.js)
```javascript
const jwt = require('jsonwebtoken');
const Message = require('../models/Message');

module.exports = (io) => {
  // Authentication middleware
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
      try {
        const { receiverId, message, bookingId } = data;
        
        // Save message to database
        const savedMessage = await Message.create({
          sender_id: socket.userId,
          receiver_id: receiverId,
          message,
          booking_id: bookingId
        });
        
        // Emit to receiver
        io.to(`user_${receiverId}`).emit('new_message', savedMessage);
        
        // Confirm to sender
        socket.emit('message_sent', savedMessage);
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });
    
    // Handle typing indicator
    socket.on('typing', (data) => {
      io.to(`user_${data.receiverId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: true
      });
    });
    
    socket.on('stop_typing', (data) => {
      io.to(`user_${data.receiverId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping: false
      });
    });
    
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};
```

---

## 📦 FILE UPLOAD SERVICE

### Upload Service (src/services/uploadService.js)
```javascript
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

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
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const folder = file.fieldname === 'resume' ? 'resumes' : 
                     file.fieldname === 'video' ? 'videos' : 'images';
      const fileName = `${folder}/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      const allowedTypes = ['application/pdf', 'application/msword', 
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      cb(null, allowedTypes.includes(file.mimetype));
    } else if (file.fieldname === 'video') {
      const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      cb(null, allowedTypes.includes(file.mimetype));
    } else {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      cb(null, allowedTypes.includes(file.mimetype));
    }
  }
});

module.exports = upload;
```
