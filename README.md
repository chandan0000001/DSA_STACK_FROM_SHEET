# DSA Stack

A full-stack DSA practice platform with authentication, daily problems, progress tracking, and rooms.

## FEATURES

- Secure auth with email and Google sign-in
- Daily problem set with progress tracking
- User profiles and rooms
- MongoDB-backed data model

## Live

- App: https://dsa-stack-from-sheet.vercel.app/
- Server status: https://stats.uptimerobot.com/FnJaBkUsgl

## Project Structure

- Backend/  Node.js + Express + MongoDB
- Frontend/ React + Vite

## Requirements

- Node.js 18+
- MongoDB Atlas(ON my project i set up URI) or local MongoDB

## Backend

```bash
cd Backend
npm install
```

Create Backend/.env:

```
MONGODB_URI=your_mongodb_atlas_uri_here
PORT=3000
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASSWORD=your_gmail_app_password_here
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
NODE_ENV=development
```

Run:

```bash
npm run dev
```

## Frontend Setup

```bash
cd Frontend
npm install
```

Create Frontend/.env:

```
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

Run:

```bash
npm run dev
```

## Scripts

Backend:
- npm run dev
- npm start

Frontend:
- npm run dev
- npm run build
- npm run preview

## Common Endpoints

- POST /user/register
- POST /user/login
- POST /user/google
- GET /problems/list
- GET /problem/daily

## Notes

- Cookies require HTTPS and sameSite=none in production.
- For Vercel SPA routing, add Frontend/vercel.json with rewrite to /.
