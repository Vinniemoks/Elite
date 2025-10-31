const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();

const PORT = process.env.PORT || 5000;
const UPLOAD_ROOT = process.env.UPLOAD_ROOT || path.join(__dirname, 'uploads');
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:8000').split(',');

// Ensure upload directories exist
const ensureDir = (p) => { if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true }); };
ensureDir(UPLOAD_ROOT);
ensureDir(path.join(UPLOAD_ROOT, 'resumes'));
ensureDir(path.join(UPLOAD_ROOT, 'videos'));
ensureDir(path.join(__dirname, 'applications'));

app.use(cors({ origin: (origin, cb) => cb(null, ALLOWED_ORIGINS.includes(origin) || !origin), credentials: false }));
app.use(express.json());

// Multer storage with per-field subdirs
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const subdir = file.fieldname === 'resume' ? 'resumes' : 'videos';
    cb(null, path.join(UPLOAD_ROOT, subdir));
  },
  filename: (req, file, cb) => {
    const safeName = (req.body.fullName || 'candidate').replace(/[^a-z0-9-_]/gi, '_');
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `${Date.now()}_${safeName}${ext}`);
  }
});

const allowedResume = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const allowedVideo = ['video/webm', 'video/mp4', 'video/ogg', 'video/quicktime'];

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB global limit; resume validated separately below
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'resume') {
      return cb(null, allowedResume.includes(file.mimetype));
    }
    if (file.fieldname === 'video' || file.fieldname === 'videoFile') {
      return cb(null, allowedVideo.includes(file.mimetype));
    }
    cb(null, true);
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/guides/apply', upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'video', maxCount: 1 },
  { name: 'videoFile', maxCount: 1 }
]), (req, res) => {
  try {
    const body = req.body || {};
    const files = req.files || {};

    // Basic server-side validations
    const required = ['fullName', 'email', 'bio'];
    for (const f of required) { if (!body[f] || !String(body[f]).trim()) return res.status(400).json({ error: `Missing required field: ${f}` }); }

    const resumeFile = files.resume?.[0];
    if (!resumeFile) return res.status(400).json({ error: 'Resume is required.' });
    if (resumeFile.size > 5 * 1024 * 1024) return res.status(413).json({ error: 'Resume exceeds 5MB limit.' });

    const videoUpload = files.video?.[0] || files.videoFile?.[0] || null;

    const application = {
      submittedAt: new Date().toISOString(),
      fullName: body.fullName,
      email: body.email,
      phone: body.phone || null,
      location: body.location || null,
      languages: body.languages || null,
      experienceYears: body.experienceYears || null,
      bio: body.bio,
      socialEmails: body.socialEmails || null,
      socialLinks: {
        facebook: body.facebook || null,
        instagram: body.instagram || null,
        twitter: body.twitter || null,
        tiktok: body.tiktok || null,
        youtube: body.youtube || null,
      },
      files: {
        resume: resumeFile ? path.relative(__dirname, resumeFile.path) : null,
        video: videoUpload ? path.relative(__dirname, videoUpload.path) : null,
      }
    };

    const safeName = String(body.fullName).replace(/[^a-z0-9-_]/gi, '_');
    const outPath = path.join(__dirname, 'applications', `${Date.now()}_${safeName}.json`);
    fs.writeFileSync(outPath, JSON.stringify(application, null, 2));

    return res.status(201).json({ message: 'Application received', application, storePath: path.relative(__dirname, outPath) });
  } catch (err) {
    console.error('Apply error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Guide application API listening on http://localhost:${PORT}`);
});