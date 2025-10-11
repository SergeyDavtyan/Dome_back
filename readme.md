# Dome.am Backend API

Backend service for Dome.am website contact form functionality.

## Features

- Email sending via SMTP
- Input validation
- Rate limiting (3 requests per minute per IP)
- CORS configuration
- Error handling

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

3. Edit `.env` with your SMTP settings:

```env
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@example.com
EMAIL_PASS=your-password
ALLOWED_ORIGINS=http://localhost:3000,https://dome.am
```

## Running

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

## API Documentation

See `swagger.yaml` for full API documentation.

### POST /send-email

Send contact form email.

**Request body:**

```json
{
  "from": "user@example.com",
  "username": "John Doe",
  "theme": "General inquiry",
  "message": "Your message here"
}
```

**Response (200):**

```json
{
  "message": "Email sent successfully",
  "messageId": "..."
}
```

**Rate Limit:** 3 requests per minute per IP
