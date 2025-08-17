# MySQL Setup Guide for Store Rating App

## 🎯 Assignment Compliance
This guide converts your app from SQLite to **MySQL** as required by your assignment.

## 📥 Step 1: Install MySQL

### Option A: XAMPP (Recommended for Windows)
1. **Download XAMPP**: https://www.apachefriends.org/download.html
2. **Install XAMPP** with MySQL and phpMyAdmin
3. **Start XAMPP Control Panel**
4. **Start MySQL service** in XAMPP
5. **Default Settings**:
   - Host: `localhost`
   - User: `root` 
   - Password: `` (empty)
   - Port: `3306`

### Option B: MySQL Community Server
1. **Download**: https://dev.mysql.com/downloads/mysql/
2. **Install MySQL Server**
3. **Set root password** during installation
4. **Update .env file** with your password

### Option C: MySQL Workbench (GUI Tool)
1. **Download**: https://dev.mysql.com/downloads/workbench/
2. **Install for database management**

## ⚙️ Step 2: Configure Database

### Update .env file:
```env
PORT=3001
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=store_rating_app
JWT_SECRET=store_rating_app_secret_key_2024
```

**Important**: 
- If using XAMPP: Leave `DB_PASSWORD` empty
- If using MySQL Server: Set your root password

## 🚀 Step 3: Run with MySQL

### Stop Current SQLite Server
```bash
# Find and kill any running node processes
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process
```

### Start MySQL Server
```bash
cd backend
node server-mysql.js
```

### Create Demo Data
```bash
# In another terminal/command prompt
cd backend
node create-demo-data-mysql.js
```

## 🔍 Step 4: View Database Content

### Method 1: Built-in API Debug Routes
Your server includes special debug routes to view database content:

```bash
# View all tables and row counts
http://localhost:3001/api/debug/tables

# View users table
http://localhost:3001/api/debug/users

# View stores table  
http://localhost:3001/api/debug/stores

# View ratings table
http://localhost:3001/api/debug/ratings
```

### Method 2: phpMyAdmin (if using XAMPP)
1. Open browser: `http://localhost/phpmyadmin`
2. Login with root (no password if XAMPP)
3. Select `store_rating_app` database
4. Browse tables: `users`, `stores`, `ratings`

### Method 3: MySQL Workbench
1. Open MySQL Workbench
2. Connect to `localhost:3306` as `root`
3. Navigate to `store_rating_app` database
4. Browse tables and data

### Method 4: Command Line MySQL
```bash
mysql -u root -p
USE store_rating_app;
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM stores;
SELECT * FROM ratings;
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    address TEXT,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'store_owner', 'normal_user') DEFAULT 'normal_user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Stores Table
```sql
CREATE TABLE stores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(20),
    website VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Ratings Table
```sql
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    store_id INT NOT NULL,
    user_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🔐 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | Demo123! |
| Store Owner | owner@demo.com | Demo123! |
| Normal User | user@demo.com | Demo123! |

## 🌐 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database Debug**: http://localhost:3001/api/debug/tables
- **phpMyAdmin** (if XAMPP): http://localhost/phpmyadmin

## 🔧 Troubleshooting

### MySQL Connection Issues
1. **Check if MySQL is running**
2. **Verify credentials in .env**
3. **Check port 3306 is available**
4. **Ensure database permissions**

### Common Errors
```bash
# Error: ER_ACCESS_DENIED_ERROR
# Solution: Check username/password in .env

# Error: ECONNREFUSED
# Solution: Start MySQL service

# Error: ER_BAD_DB_ERROR  
# Solution: Database will be created automatically
```

### Reset Everything
```bash
# Stop all services
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process

# Restart MySQL (XAMPP)
# Restart services in XAMPP Control Panel

# Drop and recreate database
mysql -u root -p
DROP DATABASE IF EXISTS store_rating_app;
CREATE DATABASE store_rating_app;

# Restart server
node server-mysql.js

# Recreate demo data
node create-demo-data-mysql.js
```

## ✅ Verification Checklist

- [ ] MySQL server is running
- [ ] Database `store_rating_app` created
- [ ] All 3 tables created (users, stores, ratings)
- [ ] Demo data loaded successfully
- [ ] Backend server running on port 3001
- [ ] Frontend running on port 3000
- [ ] Can login with demo accounts
- [ ] Database viewing works (phpMyAdmin/Workbench/API)

## 🎯 Assignment Ready!

Your Store Rating App now uses **MySQL** as required:
- ✅ MySQL database with proper schema
- ✅ Full CRUD operations
- ✅ Proper foreign key relationships
- ✅ User authentication with bcrypt
- ✅ Role-based access control
- ✅ RESTful API design
- ✅ Database viewing capabilities

Your application is now fully compliant with MySQL requirements!
