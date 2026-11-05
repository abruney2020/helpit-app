// routes/auth.js
// handles user registration and tech signup 

const express = require('express');
const router = express.Router();
const bcryypt =  require('bcrypt');
const db = require('../db/index');

// POST /api/register - registers either employee or an IT tech
router.post('/register', async (req, res) => {
    const { username, password, role_name, tech_key } = req.body;

    try {
        // basic form valid check
        if (!username || !password || !role_name) {
            return res.status(400).json({error: 'Missing required fields (username, password or role)' });
        }

        // check if role exists in postgres database
        const roleResult = await db.query('SELECT id FROM roles WHERE role_name = $1', [role_name]);
        if (roleResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid role specified' });
        }
        const role_id = roleResult.rows[0].id;

        // hash the password securely with bcrypt (no plain text passwords!)
        const saltRounds = 10;
        const password_hash = await bcryypt.hash(password, saltRounds);

        if (role_name === 'Employee') {
            const newUser = await db.query(
                'INSERT INTO users (username, password_hash, role_id) VALUES ($1. $2, $3) RETURNING id, username',
                [username, password_hash, role_id]
            );
            return res.status(201).json({ message: 'Employee registered successfully!', user: newUser.rows[0] });
        } else if (role_name === 'Technician') {
            // make sure they entered the right secret key 
            if (tech_key !== process.env.TECH_DEPT_KEY) {
                return res.status(403).json({ error: 'Unauthorized: Invalid technician department key' });
            }

            const newTech = await db.query(
                'INSERT INTO technicians (technician_name, password, role_id) VALUES ($1,$2, $3) RETURNING id, technician_name',
                [username, password_hash, role_id]
            );
            return res.status(201).json({ message: 'Technician registered successfully', technician: newTech.rows[0] });
        }
    } catch (err) {
        console.error("registraion error:", err);
        if (err.code === '23505') {
            return res.status(400).json({ error: 'Username already taken, try another one'});
        }
        res.status(500).json({ error: 'Server error during registration' });
    }
});

module.exports = router;