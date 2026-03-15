# Sona Social Hub

Anonymous social platform for **Sona College of Technology**. Students post anonymously; officials (Professors, HoD, etc.) are identified. Reddit-style public feed + groups, with admin oversight.

## Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT
- **Frontend:** React (Vite), React Router
- **DB:** MongoDB — use database name `Sona-Social-hub` (e.g. in MongoDB Compass)

## Setup

### 1. MongoDB

- Run MongoDB locally and create / use a database named **Sona-Social-hub** (e.g. connection: `mongodb://localhost:27017/Sona-Social-hub`).

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # edit .env if needed (PORT, MONGODB_URI, JWT_SECRET)
npm run seed           # creates admin: admin@sonatech.ac.in / admin123
npm run dev            # start server (default port 5000)
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev            # Vite dev server (proxies /api and /uploads to backend)
```

Open the URL shown by Vite (e.g. http://localhost:5173).

## Roles

- **Student:** Register with any `@sonatech.ac.in` email. Can use public feed, join groups, post (anonymous), comment, like, report. Cannot create groups.
- **Official:** Register as “Official” and choose title (Professor, Assistant Professor, HoD, Principal). Account stays in “pending” until an admin approves; until then, view-only. Once approved, can create groups and post (identified, not anonymous).
- **Admin:** First user is seeded as `admin@sonatech.ac.in` (password: `admin123`). Can approve officials, manage groups, see all members/posts, handle reports, and promote users to admin.

## Features

- **Public feed:** Default view; anyone can post (text, photo, poll) and tag officials with `@`. Discussions in comments.
- **Groups:** Created by officials or admin (e.g. IT CSE). Join to see group feed; post and comment there; tag officials in the group with `@`.
- **Theme:** Light (white/blue) and dark mode; toggle in header/sidebar.
- **Auth:** Only `@sonatech.ac.in` emails; no external OAuth.

## Project structure

```
backend/          # Express API, Mongoose models, JWT auth
frontend/         # React app (Vite), pages and components
```

First login: use **admin@sonatech.ac.in** / **admin123** to approve officials and manage the platform.
