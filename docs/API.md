# REST API Specification — My Fellow Ecosystem

The `apps/api` service exposes RESTful endpoints consumed by the mobile client (`apps/mobile`), admin dashboard (`apps/admin`), and Telegram bot (`apps/bot`).

---

## 1. Authentication Endpoints

### Send Phone OTP
- **Endpoint**: `POST /api/auth/phone/send-otp`
- **Rate Limit**: 1 request per 60 seconds per phone number
- **Request Body**:
  ```json
  {
    "phoneNumber": "0912345678"
  }
  ```
- **Response** `(200 OK)`:
  ```json
  {
    "success": true,
    "message": "OTP sent successfully."
  }
  ```

### Verify Phone OTP
- **Endpoint**: `POST /api/auth/phone/verify-otp`
- **Request Body**:
  ```json
  {
    "phoneNumber": "0912345678",
    "code": "123456"
  }
  ```
- **Response** `(200 OK)`:
  ```json
  {
    "token": "sample_jwt_token_string",
    "isNewUser": false,
    "user": {
      "id": "67b9...",
      "fullName": "Student Name",
      "phoneNumber": "+251912345678",
      "role": "member"
    }
  }
  ```

### Admin Sign In
- **Endpoint**: `POST /api/auth/signin`
- **Request Body**:
  ```json
  {
    "email": "admin@4kilofellowship.org",
    "password": "securepassword"
  }
  ```
- **Response** `(200 OK)`:
  ```json
  {
    "token": "jwt_token_string",
    "user": {
      "id": "...",
      "role": "admin"
    }
  }
  ```

---

## 2. Devotions & Spiritual Content

- `GET /api/devotions/today`: Retrieve current day's devotional.
- `GET /api/devotions`: List paginated devotions (`page`, `limit`, `type: voice | text`).
- `GET /api/devotions/:id`: Devotion details by ID.
- `POST /api/devotions`: Create new devotional (Admin/Writer role required).

---

## 3. Giving & Marketplace

- `POST /api/payments/checkout`: Initialize Jami giving payment session.
- `GET /api/payments/status/:id`: Check transaction status.
- `POST /api/payments/webhook`: Ingest verified Jami checkout webhook events.
- `GET /api/marketplace`: List fellowship store products and publications.

---

## 4. Fellowship Community & Teams

- `GET /api/teams`: List all fellowship ministry teams (Prayer, Worship, Media, etc.).
- `POST /api/join-requests`: Submit a request to join a ministry team.
- `GET /api/leaders`: Directory of fellowship leadership members.
- `GET /api/events`: Upcoming fellowship conferences, prayer nights, and fellowships.
