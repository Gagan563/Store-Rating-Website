# StoreReview - Store Rating & Review Platform

A full-stack web application for rating and reviewing stores with role-based access control.

**Built by [Your Name]** - Modern store rating platform with admin management and real-time features.

## Features

- **User Authentication**: Secure JWT-based login/registration
- **Store Rating**: 1-5 star rating system with comments
- **Role-Based Access**: Admin, Store Owner, and Normal User roles
- **Admin Dashboard**: Real-time statistics and management panel
- **User Management**: Complete user and store CRUD operations
- **Responsive Design**: Modern UI with TypeScript and Tailwind CSS

## Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI components
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **SQLite** - Lightweight relational database
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## Project Structure

```
StoreReview-Application/
├── storereview-frontend/       # Next.js frontend application
│   ├── app/                    # App router pages
│   │   ├── admin/             # Admin dashboard
│   │   ├── dashboard/         # User dashboard
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   └── stores/            # Store pages
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Utility functions
│   └── package.json
├── storereview-backend/        # Express.js backend application
│   └── server/                # Server directory
│       ├── server.js          # Main server file
│       ├── package.json       # Backend dependencies
│       ├── .env               # Environment variables
│       └── store_rating_app.db # SQLite database (auto-created)
└── README.md
```

## Quick Start

### Prerequisites
- Node.js (v16+)
- npm

### Setup

1. **Backend Setup**
   ```bash
   cd storereview-backend/server
   npm install
   node server.js
   ```

2. **Frontend Setup** (New terminal)
   ```bash
   cd storereview-frontend
   npm install
   npm run dev
   ```

3. **Access Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | Admin123! |
| Store Owner | owner@example.com | Owner123! |
| Normal User | user@example.com | User123! |

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Users (Admin only)
- `GET /api/users` - Get all users

### Stores
- `GET /api/stores` - Get all stores
- `GET /api/stores/:id` - Get store by ID
- `POST /api/stores` - Create new store (authenticated)
- `PUT /api/stores/:id` - Update store (owner only)
- `DELETE /api/stores/:id` - Delete store (owner only)

### Ratings
- `GET /api/ratings` - Get all ratings (admin dashboard)
- `GET /api/ratings/user` - Get user's ratings (authenticated)
- `GET /api/stores/:store_id/ratings` - Get ratings for specific store
- `POST /api/ratings` - Create new rating (authenticated)
- `PUT /api/ratings/:id` - Update rating (owner only)
- `DELETE /api/ratings/:id` - Delete rating (owner only)

## How to Use the Application

### For Regular Users

1. **Register/Login**: Create account or sign in at the homepage
2. **Browse Stores**: View all available stores on the main page
3. **Rate a Store**: Click "Rate Store" button, select 1-5 stars and add comment
4. **View Dashboard**: Go to `/dashboard` to see your ratings
5. **Manage Ratings**: Edit or delete your own ratings

### For Store Owners

1. **Register** with "Store Owner" role
2. **Add Store**: Create and manage your stores
3. **View Store Ratings**: See all ratings for your stores
4. **Update Store Info**: Edit store details anytime

### For Administrators

1. **Login** with admin account
2. **Access Admin Panel**: Go to `/admin/dashboard`
3. **View Statistics**: See total users, stores, ratings, average rating
4. **Manage Users**: Add, edit, view, or delete user accounts
5. **Manage Stores**: Full control over all stores in the system
6. **Monitor Ratings**: View, manage, and moderate all ratings
7. **Real-time Updates**: Data automatically refreshes every 30 seconds
8. **Manual Refresh**: Click "Refresh Data" button for instant updates

## Key Features in Detail

### Real-time Admin Dashboard
- **Auto-refresh**: Updates every 30 seconds automatically
- **Manual refresh**: "Refresh Data" button for instant updates
- **Live statistics**: Real-time count of users, stores, ratings
- **Calculated metrics**: Average rating computed from all ratings
- **Sortable tables**: Click column headers to sort data
- **Search & filter**: Filter by role, status, category, etc.

### Rating System
- **Star Rating**: 1-5 star scale with visual feedback
- **Comments**: Optional text reviews
- **User Restrictions**: One rating per user per store
- **Edit/Delete**: Users can modify their own ratings
- **Real-time Updates**: New ratings appear in admin dashboard within 30 seconds

### User Management
- **Role-based Access**: Admin, Store Owner, Normal User
- **Profile Validation**: Strict validation rules for all fields
- **Status Management**: Active/inactive user status
- **Secure Authentication**: JWT tokens with bcrypt password hashing

## Troubleshooting

### Common Issues

1. **"Port 3001 already in use"**
   ```powershell
   netstat -ano | findstr :3001
   taskkill /F /PID <process_id>
   ```

2. **"Cannot GET /api/ratings"**
   - Make sure backend server is running
   - Check if `.env` file exists with JWT_SECRET

3. **"CORS policy error"**
   - Ensure backend server started before rateflow-frontend
   - Check both servers are running on correct ports

4. **"Database locked" errors**
   - Close any SQLite browser tools
   - Restart the backend server

5. **rateflow-frontend won't load**
   ```powershell
   cd rateflow-frontend
   rm -rf .next
   npm run dev
   ```

### Quick Restart Steps

**If something goes wrong, follow these steps:**

1. **Stop both servers** (Ctrl+C in both terminals)

2. **Restart Backend:**
   ```powershell
   cd "rateflow-backend\server"
   node server.js
   ```

3. **Restart rateflow-frontend:**
   ```powershell
   cd "rateflow-frontend"
   npm run dev
   ```

4. **Check both are running:**
   - Backend: http://localhost:3001
   - rateflow-frontend: http://localhost:3000

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    address TEXT,
    role TEXT DEFAULT 'normal_user',
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Stores Table
```sql
CREATE TABLE stores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    category TEXT,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

### Ratings Table
```sql
CREATE TABLE ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    store_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

---

## Summary

StoreReview is a complete full-stack application featuring:

✅ Modern Next.js frontend with TypeScript  
✅ Express.js REST API backend  
✅ SQLite database with proper schema  
✅ JWT authentication & role-based access  
✅ Real-time admin dashboard  
✅ Complete CRUD operations  
✅ Responsive design with modern UI  

**Perfect for interviews and portfolio projects!** 🚀

