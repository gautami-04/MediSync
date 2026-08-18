# MediSync — Low-Level Design (LLD)

## 1. Backend Structure

```text
backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── services/
├── utils/
├── app.js
└── server.js
```

### Responsibilities

* **Routes** → Define API endpoints.
* **Controllers** → Handle requests and responses.
* **Models** → Define MongoDB schemas.
* **Middleware** → Authentication, authorization, validation and uploads.
* **Services** → Handle reusable business operations and external services.
* **Config** → Database and application configuration.

---

## 2. Database Models

MediSync uses MongoDB with Mongoose.

```text
User
 ├── Patient
 └── Doctor

Patient
 ├── Appointments
 ├── MedicalRecords
 ├── Prescriptions
 ├── Payments
 └── Reviews

Doctor
 ├── Appointments
 ├── Prescriptions
 └── Reviews
```

Main models:

* User
* Patient
* Doctor
* Appointment
* MedicalRecord
* Prescription
* Payment
* Review
* Notification

---

## 3. Authentication

```text
Register / Login
       ↓
Validate Input
       ↓
Verify Password
       ↓
Generate JWT
       ↓
Authenticated Request
       ↓
Auth Middleware
       ↓
Role Middleware
       ↓
Protected Controller
```

Passwords are hashed using **Bcrypt**, while JWT is used to authenticate protected requests.

---

## 4. Main API Modules

| Module          | Main Operations                      |
| --------------- | ------------------------------------ |
| Auth            | Register, Login, OTP, Password Reset |
| Users           | Profile management                   |
| Doctors         | Profile, search, availability        |
| Patients        | Profile and health information       |
| Appointments    | Book, view, cancel, reschedule       |
| Medical Records | Upload, view, manage                 |
| Prescriptions   | Create and view                      |
| Payments        | Process and view transactions        |
| Reviews         | Add and view reviews                 |
| Notifications   | Create and retrieve notifications    |
| Admin           | User and system management           |

---

## 5. Appointment Flow

```text
Patient selects doctor
        ↓
Selects date & time
        ↓
POST appointment request
        ↓
Auth + Role Middleware
        ↓
Check slot availability
        ↓
Create Appointment
        ↓
Save to MongoDB
        ↓
Create Notification
        ↓
Return response
```

The backend checks for an existing appointment before confirming a slot to prevent double booking.

---

## 6. Medical Record Flow

```text
Patient uploads file
        ↓
Upload Middleware
        ↓
Cloudinary
        ↓
File URL generated
        ↓
MedicalRecord saved in MongoDB
        ↓
Patient can retrieve record
```

---

## 7. Payment Flow

```text
Patient
   ↓
Select Appointment
   ↓
Payment Request
   ↓
Payment Service
   ↓
Payment Status
   ↓
Save Payment Record
   ↓
Return Result
```

Payment may use a real gateway or a mock implementation depending on the deployed version.

---

## 8. Prescription Flow

```text
Doctor
   ↓
Select Patient
   ↓
Create Prescription
   ↓
Backend Validation
   ↓
Save to MongoDB
   ↓
Patient Views Prescription
```

---

## 9. Frontend Structure

```text
frontend/src/
├── components/
├── pages/
├── context/
├── hooks/
├── routes/
├── services/
├── utils/
└── styles/
```

* **Components** → Reusable UI.
* **Pages** → Application screens.
* **Context** → Global state.
* **Hooks** → Reusable React logic.
* **Services** → API calls.
* **Routes** → Navigation and protected routes.
* **Utils** → Helper functions.

---

## 10. Request Flow

```text
React Component
      ↓
Frontend Service
      ↓
REST API
      ↓
Express Route
      ↓
Middleware
      ↓
Controller
      ↓
Service / Model
      ↓
MongoDB
      ↓
JSON Response
      ↓
React UI
```

## 11. Error Handling

The backend uses centralized error handling.

Common responses:

| Code | Meaning         |
| ---- | --------------- |
| 200  | Success         |
| 201  | Created         |
| 400  | Invalid request |
| 401  | Unauthorized    |
| 403  | Forbidden       |
| 404  | Not found       |
| 500  | Server error    |

## 12. Security

* Password hashing using Bcrypt.
* JWT authentication.
* Role-based authorization.
* Protected API routes.
* Backend input validation.
* Environment variables for sensitive credentials.
* Controlled file uploads.

## 13. Summary

The LLD separates MediSync into independent **routes, controllers, middleware, services, models, and frontend modules**, making the system easier to maintain, test, and extend.
