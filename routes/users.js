// routes/users.js
const express = require('express');
const router = express.Router();
const db = require('../db/index');

router.get('/users', async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.username, r.role_name AS role_name
            FROM users u 
            JOIN roles r ON u.role_id = r.id 
            ORDER BY u.id DESC
        `;
        const result = await db.query(query);
        res.status(200).json({
            status: 'success',
            count: result.rows.length,
            users: result.rows
        });
    } catch (err) {
        console.error("error fetching users:", err);
        res.status(500).json({ error: 'Failed to fetch registered users' });
    }
});

router.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id, username', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ status: 'success', deletedUser: result.rows[0] });
    } catch (err) {
        console.error("error deleting user:", err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

module.exports = router;