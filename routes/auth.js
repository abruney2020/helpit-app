// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db/index');

router.post('/register', async (req, res) => {
    const { username, password, role_name, tech_key } = req.body;

    try {
        if (!username || !password || !role_name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Validate role exists in database
        const roleResult = await db.query('SELECT id FROM roles WHERE role_name = $1', [role_name]);
        if (roleResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid role specified' });
        }
        const role_id = roleResult.rows[0].id;

        // If registering as Technician, verify the secret department key
        if (role_name === 'Technician') {
            const validKey = process.env.TECH_DEPT_KEY || 'TECH2026';
            if (tech_key !== validKey) {
                return res.status(403).json({ error: 'Unauthorized: Invalid technician department key' });
            }
        }

        // Hash password securely with bcrypt
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Insert user into PostgreSQL
        const newUser = await db.query(
            'INSERT INTO users (username, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id, username',
            [username, password_hash, role_id]
        );

        return res.status(201).json({ 
            message: `${role_name} registered successfully!`, 
            user: newUser.rows[0] 
        });

    } catch (err) {
        console.error("registration error:", err);
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Username already taken, try another one' });
        }
        res.status(500).json({ error: 'Server error during registration' });
    }
});

module.exports = router;