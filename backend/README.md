# MediSync Backend

Express and MongoDB API for authentication, user profiles, doctor profiles, appointments, and medical records.

## Tech Stack

- Node.js
- Express
- MongoDB (Mongoose)
- JWT authentication
- bcryptjs (password hashing)
- dotenv
- cors

## Project Structure

```text
backend/
  app.js
  server.js
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
```

## Prerequisites

- Node.js 18+
- MongoDB connection URI (Atlas)

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the backend root:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/medisync
JWT_SECRET=replace_with_a_strong_secret
EMAIL_USER=medisyncg6@gmail.com
EMAIL_PASS=your_gmail_app_password
```

### Variable Notes

- `PORT` (optional): Server port. Defaults to `5000` if not set.
- `MONGO_URI` (required): MongoDB connection string.
- `JWT_SECRET` (required): Secret used to sign and verify JWTs.
- `EMAIL_USER` (required for OTP email): Sender Gmail address.
- `EMAIL_PASS` (required for OTP email): Gmail app password for `EMAIL_USER`.

## Run

```bash
npm start
```

Server base URL:

```text
http://localhost:5000
```

Health check:

```http
GET /
```

## Authentication

Use the access token returned from login/register as a bearer token:

```http
Authorization: Bearer <token>
```

## API Routes

Base path for all APIs: `/api`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`

### Users

- `GET /api/users/me` (protected)

### Appointments

- `POST /api/appointments/book` (protected)
- `GET /api/appointments/my` (protected)
- `PUT /api/appointments/cancel/:id` (protected)
- `GET /api/appointments/doctor` (protected)

### Doctors

- `GET /api/doctors`
- `GET /api/doctors/:id`
- `GET /api/doctors/profile/me` (protected, doctor/admin)
- `POST /api/doctors/profile` (protected, doctor/admin)
- `PUT /api/doctors/profile` (protected, doctor/admin)
- `DELETE /api/doctors/profile/:id` (protected, doctor/admin)

### Medical Records

- `POST /api/medical-records` (protected, doctor/admin)
- `GET /api/medical-records/my` (protected, patient)
- `GET /api/medical-records/doctor/my` (protected, doctor/admin)
- `GET /api/medical-records/:id` (protected)
- `PUT /api/medical-records/:id` (protected, doctor/admin)
- `DELETE /api/medical-records/:id` (protected, doctor/admin)

## Current Notes

- Route files exist for `patient`, `payment`, and `review`, but they are currently empty and not mounted in `app.js`.
- Error-handling middleware file exists but is not wired in `app.js` yet.

## Frontend Integration

- Development: set the frontend API base URL in `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000
```

- Run both servers for local development:

```bash
# backend
cd backend
npm install
npm start

# frontend (in a separate terminal)
cd frontend
npm install
npm run dev
```

- Production: build the frontend and start the backend (backend will serve `frontend/dist` when `NODE_ENV=production`):

```bash
cd frontend
npm run build

# then start backend in production mode
cd ../backend
NODE_ENV=production npm start
```

Note: On Windows PowerShell set `NODE_ENV` with `$env:NODE_ENV='production'; npm start`.

## Scripts

- `npm start`: Runs `node server.js`

## License

ISC
