# AB WebStore 🛒

A full-stack e-commerce web application built with Next.js, Node.js/Express, and MySQL.

## Live URLs
- **Frontend:** https://ab-web-store-gules.vercel.app
- **Backend API:** https://ab-webstore-backend.onrender.com

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MySQL (Railway) |
| Auth | JWT + bcryptjs |
| Deployment | Vercel (frontend), Render (backend), Railway (DB) |
| CI/CD | GitHub Actions |
| Containerization | Docker + Docker Compose |

## Features
- Product listing with search and category filtering
- Product detail pages
- Shopping cart (add, remove, update quantity)
- User authentication (register/login)
- Checkout with order placement
- Order history and tracking
- Admin product management

## Local Development

### Prerequisites
- Node.js 20+
- Docker Desktop

### Run with Docker
```bash
docker-compose up --build
```
App will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Run without Docker

**Backend:**
```bash
cd backend
npm install
# configure .env (copy from .env.example)
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
# configure .env.local (copy from .env.example)
npm run dev
```

## Database Setup
Run `backend/src/config/schema.sql` on your MySQL instance to create tables and seed data.

**Default admin credentials:**
- Email: `admin@abstore.com`
- Password: `password`

## Environment Variables

**Backend `.env`:**
```
PORT=5000
DB_HOST=your_host
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=railway
JWT_SECRET=your_secret
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## CI/CD
GitHub Actions pipeline (`.github/workflows/ci.yml`) runs on every push to `main`:
1. Backend build & test
2. Frontend build
3. Docker image builds

## Project Structure
```
ab_web_store/
├── backend/
│   ├── src/
│   │   ├── config/       # DB connection & schema
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # JWT auth
│   │   └── routes/       # API routes
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   ├── components/   # Reusable components
│   │   ├── context/      # Cart & Auth state
│   │   └── lib/          # Axios instance
│   └── Dockerfile
├── docker-compose.yml
└── .github/workflows/ci.yml
```
