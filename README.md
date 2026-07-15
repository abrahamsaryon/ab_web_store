# AB WebStore 🛒

A full-stack e-commerce web application built with Next.js 14, Node.js/Express, and MySQL — deployed on Vercel, Render, and Railway.

## 🌐 Live URLs
| Service | URL |
|---|---|
| Frontend | https://ab-web-store-gules.vercel.app |
| Backend API | https://ab-webstore-backend.onrender.com |
| GitHub Repo | https://github.com/abrahamsaryon/ab_web_store |

---

## 🛠 Tech Stack
| Layer | Technology |
|---|---|
| Frontend | Next.js 14, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MySQL 8 (Railway) |
| Auth | JWT + bcryptjs |
| Image Storage | Cloudinary |
| Deployment | Vercel (frontend), Render (backend), Railway (DB) |
| CI/CD | GitHub Actions |
| Containerization | Docker + Docker Compose |

---

## ✨ Features

### Customer
- Responsive homepage with dynamic hero banner carousel
- Product listing with search, category filtering, and pagination
- Product detail page with multiple images, variants, and verified reviews
- Shopping cart — add, remove, update quantity, auto-calculated totals
- Checkout with shipping form, order summary, and payment method selection
- Order confirmation page and order history tracking
- User registration and login (JWT-based)
- Customer dashboard — profile, password change, order history, reviews
- WhatsApp Buy Button for direct product ordering

### Admin Dashboard
- Overview stats — total products, orders, revenue, customers
- Revenue chart (last 30 days) and orders by status breakdown
- Product management — CRUD, multi-image upload, variants, WhatsApp toggle, pagination
- Order management — status updates, filters, per-status counts, pagination
- Customer management — view profiles, suspend/activate, create/edit/delete, pagination
- Review moderation — approve/reject/delete, verified purchase badge
- Site settings — name, logo, banners (with reorder), site notice, contact, social links
- Account settings — profile edit, password change, admin team management

---

## 🗄 Database Tables

| Table | Description |
|---|---|
| `users` | Customers and admins with role and status |
| `categories` | Product categories |
| `products` | Product catalog with WhatsApp support |
| `product_images` | Multiple images per product |
| `product_variants` | Size/color variants with price modifiers |
| `orders` | Customer orders with status tracking |
| `order_items` | Line items per order |
| `reviews` | Product reviews with moderation |
| `banners` | Homepage hero banners |
| `settings` | Site-wide configuration (key/value) |

Database script: `backend/src/config/schema.sql`

**Default admin credentials:**
- Email: `admin@abstore.com`
- Password: `password`

---

## 🚀 Local Development

### Prerequisites
- Node.js 20+
- Docker Desktop

### Run with Docker (Recommended)
```bash
git clone https://github.com/abrahamsaryon/ab_web_store.git
cd ab_web_store
docker-compose up --build
```
| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |

### Run without Docker

**Backend:**
```bash
cd backend
npm install
cp .env.example .env   # fill in your DB credentials
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL
npm run dev
```

---

## 🔐 Environment Variables

**Backend `.env`:**
```
PORT=5000
DB_HOST=your_host
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=railway
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:3000
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🔄 CI/CD Pipeline

GitHub Actions pipeline (`.github/workflows/ci.yml`) triggers on every push to `main`:

```
push to main
    ├── Job 1: Build & Test Backend  (Node 20, npm install, smoke test)
    ├── Job 2: Build Frontend        (Node 20, npm install, next build)
    └── Job 3: Docker Build          (builds backend + frontend images)
```

Vercel auto-deploys the frontend on every successful push to `main`.

---

## 🐳 Docker

Three services defined in `docker-compose.yml`:

| Service | Image | Port |
|---|---|---|
| `db` | mysql:8 | 3306 |
| `backend` | node:20-alpine | 5000 |
| `frontend` | node:20-alpine | 3000 |

The `db` service auto-initializes the database from `schema.sql` on first run.

---

## 📁 Project Structure

```
ab_web_store/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection, Cloudinary, schema.sql
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # JWT auth, admin guard
│   │   └── routes/         # API routes
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/            # Next.js pages (admin, auth, cart, checkout, orders, products)
│   │   ├── components/     # Navbar, Footer, ProductCard, AdminSidebar, UI components
│   │   ├── context/        # AuthContext, CartContext, SettingsContext
│   │   └── lib/            # Axios instance
│   ├── Dockerfile
│   └── package.json
├── screenshots/            # Application screenshots
├── REPORT.md               # Full project report
├── REPORT.docx             # Project report (Word format)
├── docker-compose.yml
└── .github/
    └── workflows/
        └── ci.yml
```

---

## 📊 API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login and get JWT |
| GET | `/api/products` | — | List products (paginated, search, filter) |
| GET | `/api/products/:id` | — | Get product details |
| POST | `/api/products` | Admin | Create product |
| PUT | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| GET | `/api/orders` | Admin | Get all orders |
| GET | `/api/orders/stats` | Admin | Get dashboard stats + revenue chart |
| POST | `/api/orders` | User | Place order |
| PUT | `/api/orders/:id/status` | Admin | Update order status |
| GET | `/api/users` | Admin | List all users |
| PATCH | `/api/users/:id/status` | Admin | Suspend/activate user |
| GET | `/api/reviews` | Admin | List reviews |
| PUT | `/api/reviews/:id/status` | Admin | Approve/reject review |
| GET | `/api/settings` | — | Get site settings |
| PUT | `/api/settings` | Admin | Update site settings |
| GET | `/api/banners` | — | Get active banners |
| POST | `/api/upload` | User | Upload image to Cloudinary |

---

## 📄 Project Report

Full project report available in:
- [`REPORT.md`](./REPORT.md) — Markdown format
- [`REPORT.docx`](./REPORT.docx) — Word format

---

*EWA408510 – E-Commerce and Web Application | Academic Year 2025–2026*
