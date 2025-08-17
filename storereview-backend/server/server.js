const express = require('express');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());

// CORS configuration for production
const corsOptions = {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionSuccessStatus: 200
};

app.use(cors(corsOptions));

// SQLite database setup
const dbPath = path.join(__dirname, 'store_rating_app.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            username TEXT UNIQUE,
            email TEXT NOT NULL UNIQUE,
            address TEXT,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'normal_user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS stores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            address TEXT NOT NULL,
            phone TEXT,
            website TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS ratings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            store_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
});

// Helper functions for database operations
// Get all users
app.get('/api/users', async (req, res) => {
    try {
        const usersRaw = await allQuery('SELECT id, name, email, address, role FROM users');
        // Add default status and rating fields for frontend compatibility
        const users = usersRaw.map(u => ({
            ...u,
            status: 'active',
            rating: null
        }));
        res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
function runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) {
                reject(err);
            } else {
                resolve({ id: this.lastID, changes: this.changes });
            }
        });
    });
}

function getQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.get(query, params, (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function allQuery(query, params = []) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Backend server is running!');
});

// Test DB connection
app.get('/test-db', async (req, res) => {
    try {
        const result = await getQuery('SELECT 1 + 1 AS solution');
        res.json({ message: 'Database connection successful!', solution: result.solution });
    } catch (error) {
        console.error('Database connection error:', error);
        res.status(500).json({ message: 'Database connection failed', error: error.message });
    }
});

// User Registration Route
app.post('/api/register', async (req, res) => {
    const { name, username, email, address, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    try {
        const existingUser = await getQuery('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
        if (existingUser) {
            return res.status(409).json({ message: 'Username or email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await runQuery(
            'INSERT INTO users (name, username, email, address, password, role) VALUES (?, ?, ?, ?, ?, ?)',
            [name, username || email, email, address, hashedPassword, role || 'normal_user']
        );
        
        res.status(201).json({ message: 'User registered successfully', userId: result.id });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await getQuery('SELECT * FROM users WHERE email = ?', [email]);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );
        
        res.status(200).json({ 
            message: 'Logged in successfully', 
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Store routes
app.post('/api/stores', authenticateToken, async (req, res) => {
    const { name, address, phone, website, description } = req.body;
    const userId = req.user.id;

    if (!name || !address) {
        return res.status(400).json({ message: 'Store name and address are required.' });
    }

    try {
        const result = await runQuery(
            'INSERT INTO stores (user_id, name, address, phone, website, description) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, name, address, phone, website, description]
        );
        res.status(201).json({ message: 'Store created successfully', storeId: result.id });
    } catch (error) {
        console.error('Error creating store:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/stores', async (req, res) => {
    try {
        const stores = await allQuery(`
            SELECT s.*, u.name as owner_name 
            FROM stores s 
            LEFT JOIN users u ON s.user_id = u.id
        `);
        res.status(200).json({ stores });
    } catch (error) {
        console.error('Error fetching stores:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/stores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const store = await getQuery(`
            SELECT s.*, u.name as owner_name 
            FROM stores s 
            LEFT JOIN users u ON s.user_id = u.id 
            WHERE s.id = ?
        `, [id]);
        
        if (!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        res.status(200).json(store);
    } catch (error) {
        console.error('Error fetching store by ID:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/api/stores/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { name, address, phone, website, description } = req.body;
    const userId = req.user.id;

    try {
        const result = await runQuery(
            'UPDATE stores SET name = ?, address = ?, phone = ?, website = ?, description = ? WHERE id = ? AND user_id = ?',
            [name, address, phone, website, description, id, userId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Store not found or you do not have permission to update this store' });
        }
        res.status(200).json({ message: 'Store updated successfully' });
    } catch (error) {
        console.error('Error updating store:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/api/stores/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await runQuery('DELETE FROM stores WHERE id = ? AND user_id = ?', [id, userId]);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Store not found or you do not have permission to delete this store' });
        }
        res.status(200).json({ message: 'Store deleted successfully' });
    } catch (error) {
        console.error('Error deleting store:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Rating routes
app.post('/api/ratings', authenticateToken, async (req, res) => {
    const { store_id, rating, comment } = req.body;
    const userId = req.user.id;

    if (!store_id || !rating) {
        return res.status(400).json({ message: 'Store ID and rating are required.' });
    }

    try {
        const result = await runQuery(
            'INSERT INTO ratings (store_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
            [store_id, userId, rating, comment]
        );
        res.status(201).json({ message: 'Rating added successfully', ratingId: result.id });
    } catch (error) {
        console.error('Error adding rating:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/api/stores/:store_id/ratings', async (req, res) => {
    const { store_id } = req.params;
    try {
        const ratings = await allQuery(
            'SELECT r.*, u.name FROM ratings r JOIN users u ON r.user_id = u.id WHERE r.store_id = ?',
            [store_id]
        );
        res.status(200).json(ratings);
    } catch (error) {
        console.error('Error fetching ratings for store:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.put('/api/ratings/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    try {
        const result = await runQuery(
            'UPDATE ratings SET rating = ?, comment = ? WHERE id = ? AND user_id = ?',
            [rating, comment, id, userId]
        );

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Rating not found or you do not have permission to update this rating' });
        }
        res.status(200).json({ message: 'Rating updated successfully' });
    } catch (error) {
        console.error('Error updating rating:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.delete('/api/ratings/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const result = await runQuery('DELETE FROM ratings WHERE id = ? AND user_id = ?', [id, userId]);

        if (result.changes === 0) {
            return res.status(404).json({ message: 'Rating not found or you do not have permission to delete this rating' });
        }
        res.status(200).json({ message: 'Rating deleted successfully' });
    } catch (error) {
        console.error('Error deleting rating:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all ratings for admin dashboard
app.get('/api/ratings', async (req, res) => {
    try {
        const ratings = await allQuery(
            `SELECT r.id, r.rating, r.comment, r.created_at as date, 
                    u.name as user, s.name as store 
             FROM ratings r 
             JOIN users u ON r.user_id = u.id 
             JOIN stores s ON r.store_id = s.id 
             ORDER BY r.created_at DESC`
        );
        res.status(200).json({ ratings });
    } catch (error) {
        console.error('Error fetching all ratings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get all ratings for the authenticated user
app.get('/api/ratings/user', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    try {
        const ratings = await allQuery(
            `SELECT r.*, s.name as store FROM ratings r JOIN stores s ON r.store_id = s.id WHERE r.user_id = ? ORDER BY r.created_at DESC`,
            [userId]
        );
        res.status(200).json({ ratings });
    } catch (error) {
        console.error('Error fetching user ratings:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
