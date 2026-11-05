// HelpIT - server.js
// By: Ajani 
// Capstone project backend server setup w/ Express & PostgreSQL

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const db = require('./db/index');
const authRoutes = require('./routes/auth'); // imported our modular route listeners here!

const app = express();
const PORT = process.env.PORT || 5000;

// global middleware setup (must stay here so it runs on all incoming requests)
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // serves our static frontend ui files

// health check route to test db connection real quick
app.get('/api/health', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.status(200).json({
            status: 'success',
            message: 'HelpIT API is running and connected to PostgreSQL',
            timestamp: result.rows[0].now
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// mount our modular api route listeners
app.use('/api', authRoutes);

// fire up the express server
app.listen(PORT, () => {
    console.log(`Server is running and listening on port ${PORT}`);
});