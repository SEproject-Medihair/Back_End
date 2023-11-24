const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const config = require('../config');

// Database connection setup (similar to what you did in your main file)
var connection = mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
});

// Handle the POST request to save chat messages
router.post('/', (req, res) => {
    const { email } = req.body;

    connection.query('SELECT Username, Chat_message, Who FROM Chat_log WHERE Username = ? ORDER BY Chat_log_times DESC LIMIT 10;', [email], function(err, results) {
        if (err) {
            console.error('DB Error:', err);
            return res.status(500).json({ error: 'DB에 저장하는 도중 오류가 발생했습니다.' });
        }
            return res.status(200).json(results);
    });
    
});

module.exports = router;