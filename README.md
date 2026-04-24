# PICT Event Management System

A full-stack MERN application for managing events across all PICT clubs.

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend Setup

```bash
cd backend
npm install
```

Edit `backend/.env` if needed (default uses local MongoDB):
```
MONGO_URI=mongodb://localhost:27017/pict_events
JWT_SECRET=pict_secret_key_2024
PORT=5000
```

Seed the database:
```bash
npm run seed
```

Start the backend:
```bash
npm run dev
```

Backend runs at `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

---

## Admin Credentials (after seeding)

| Username | Password | Club |
|---|---|---|
| `acm_student_chapter` | `admin123` | ACM Student Chapter |
| `ieee_student_branch` | `admin123` | IEEE Student Branch |
| `csi_student_branch` | `admin123` | CSI Student Branch |
| `iste_student_chapter` | `admin123` | ISTE Student Chapter |
| `nss_unit` | `admin123` | NSS Unit |
| `cultural_club` | `admin123` | Cultural Club |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/clubs` | No | Get all clubs |
| PUT | `/clubs/:id/tentative-dates` | Admin | Add tentative date |
| DELETE | `/clubs/:id/tentative-dates/:entryId` | Admin | Remove tentative date |
| GET | `/events` | No | Get all events |
| GET | `/events/:id` | No | Get event by ID |
| POST | `/events` | Admin | Create event |
| PUT | `/events/:id` | Admin | Update event |
| DELETE | `/events/:id` | Admin | Delete event |
| POST | `/register` | No | Register for event |
| GET | `/admin/registrations` | Admin | Get club registrations |
| POST | `/admin/login` | No | Admin login |

---

## Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS v4 + React Router v7
- **Backend**: Node.js + Express + Mongoose
- **Database**: MongoDB
- **Auth**: JWT (24h expiry)
