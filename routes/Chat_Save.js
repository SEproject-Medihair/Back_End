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
    const { email, message, send_or_sent } = req.body;

    connection.query('INSERT INTO Chat_log (Username, Chat_message, Who) VALUES (?,?,?) ', [email, message, send_or_sent], function (err, results) {
        if (err) {
            console.error('DB Error:', err);
            return res.status(500).json({ error: 'DB에 저장하는 도중 오류가 발생했습니다.' });
        }
        return res.status(200).json({ message: '정보가 성공적으로 저장되었습니다.' });
    });
});

module.exports = router;
