# Elite Guide Application API

Minimal Express API that accepts guide applications and uploads.

## Setup

1. Ensure Node.js 18+ is installed.
2. Create `.env` from `.env.example` and adjust values as needed.
3. Install dependencies:
   - `npm install`
4. Run the server:
   - `npm start`

The API listens on `http://localhost:5000` by default.

## Endpoints

- `GET /health` – health check.
- `POST /api/guides/apply` – accepts `multipart/form-data`:
  - Fields: `fullName` (required), `email` (required), `bio` (required), optional profile fields.
  - Files: `resume` (required, PDF/DOC/DOCX, ≤5MB), `video` or `videoFile` (optional, WEBM/MP4/OGG).

Uploaded files are stored under `backend/uploads/resumes` and `backend/uploads/videos`.
Application JSON summaries are saved under `backend/applications/`.

## CORS

Set `ALLOWED_ORIGINS` in `.env` (comma-separated) to permit frontend requests.

## Notes

- This stub does not include authentication, virus scanning, or cloud storage.
- For production, integrate a managed storage service, add validation, and security controls.