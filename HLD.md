# MediSync — High-Level Design (HLD)

## 1. Overview

MediSync is a full-stack digital healthcare and doctor appointment system connecting **Patients, Doctors, and Admins**.

The system allows users to manage appointments, medical records, prescriptions, payments, reviews, and notifications.

## 2. Technology Stack

| Layer          | Technology           |
| -------------- | -------------------- |
| Frontend       | React.js + Vite      |
| Backend        | Node.js + Express.js |
| Database       | MongoDB + Mongoose   |
| Authentication | JWT + Bcrypt         |
| Email/OTP      | Nodemailer           |
| File Storage   | Cloudinary           |

## 3. System Architecture

```text
┌─────────────────────────────┐
│       Patient / Doctor      │
│           / Admin           │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│       React Frontend        │
│  Pages │ Components │ API   │
└──────────────┬──────────────┘
               │ REST APIs
               ▼
┌─────────────────────────────┐
│    Node.js + Express.js     │
│ Routes → Middleware →       │
│ Controllers → Services      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          MongoDB            │
│ Users │ Doctors │ Patients  │
│ Appointments │ Payments     │
│ Records │ Reviews           │
└─────────────────────────────┘

External Services:
Cloudinary → File Storage
Nodemailer → Email / OTP
```

## 4. Main Modules

### Patient

* Manage profile
* Search doctors
* Book/manage appointments
* View medical records and prescriptions
* Make payments
* Reviews and favorites
* Notifications

### Doctor

* Manage profile
* Set availability and consultation fees
* Manage appointments
* View patient information
* Create prescriptions
* View earnings/statistics

### Admin

* Manage users
* Manage doctors and patients
* Monitor appointments
* Monitor payments
* View system analytics
* Handle complaints

## 5. Authentication & Security

MediSync uses:

* JWT-based authentication
* Bcrypt password hashing
* OTP verification
* Role-based access control
* Protected API routes
* Backend input validation

```text
Login
  ↓
Validate Credentials
  ↓
Generate JWT
  ↓
Protected API Request
  ↓
Auth Middleware
  ↓
Role Check
  ↓
Controller
```

## 6. Database

MongoDB stores the main application data:

```text
User
 ├── Patient
 └── Doctor

Patient ─── Appointment ─── Doctor
   │
   ├── Medical Records
   ├── Prescriptions
   ├── Payments
   └── Reviews
```

## 7. Appointment Flow

```text
Patient
  ↓
Search Doctor
  ↓
Select Date & Time
  ↓
Backend Validates Slot
  ↓
Create Appointment
  ↓
Payment
  ↓
Confirmation + Notification
```

The backend prevents double booking by validating the selected doctor, date, and time before creating an appointment.

## 8. Design Principles

* Separation of frontend and backend responsibilities.
* Business logic handled by the backend.
* RESTful API communication.
* Role-based authorization.
* Modular and maintainable code structure.
* Responsive frontend design.

## 9. Summary

MediSync uses a **React + Express + MongoDB** architecture where the frontend consumes REST APIs, the backend handles authentication and business logic, and MongoDB manages persistent data.
