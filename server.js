// HelpIT - server.js
// By: Ajani 
// Capstone project backend server setup w/ Express & PostgreSQL

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const db = require('./db/index');

const app = express();
const PORT = process.env.PORT || 5000;

// middlewarre
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serves html & css frontend files

// health check route 
app.get('/api/health', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.status(200).json({
            status: 'success',
            message: 'HelpIT API is running and now connected to PostgreSQL',
            timestamp: result.rows[0].now
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// registration route handling both employees and techs w/ brcypt 
app.post('/api/register', async (req, res) => {
    const { username, password, role_name, tech_key } = req.body;

    try {
        if (!username || !password || !role_name) {
            return res.status(400).json({error: 'Missing required fields (username, password, or role)'});
        }

        // check if role exist in lookup table 
        const roleResult = await db.query('SELECT id FROM roles WHERE role_name = $1', [role_name]);
        if (roleResult.rows.length === 0) {
            return res.status(400).json({error: 'Invalid role specified'});
        }
        const role_id = roleResult.rows[0].id;

        // hash password the securely using bcrypt 
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        if (role_name === 'Employee') {
            const newUser = await db.query(
                'INSERT INTO users (username, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id, username',
                [username, password_hash, role_id]
            );
            return res.status(201).json({message: 'Employee registered successfully!', user: newUser.rows[0] });
        } else if (role_name === 'Technician') {
            // make sure theu put in the right department key
            if (tech_key !== process.env.TECH_DEPT_KEY) {
                return res.status(403).json({error: 'Unauthorized: Invalid technician department key' });
            }

            const newTech = await db.query(
                'INSERT INTO technicians (technician_name, password_hash, role_id) VALUES ($1, $2, $3) RETURNING id, technician_name',
                [username, password_hash, role_id]
            );
            return res.status(201).json({message: 'Technician registered successfully!', technician: newTech.rows[0] });
        }

    } catch (err) {
        console.error("registration error:", err);
        if (err.code === '23505') {
            return res.status(400).json({error: 'Username already take, try another one' });
        }
        res.status(500).json({error: 'Username already taken, try another one' });
    }
});

// fire up the serv
app.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}`);
});
