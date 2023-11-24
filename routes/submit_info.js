const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const config = require('../config');

// Create a MySQL connection
const connection = mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
});

// Connect to the database
connection.connect(function(err) {
    if (err) {
        console.error('Error connecting to database:', err.stack);
        return;
    }
    console.log('Connected to database as id ' + connection.threadId);
});

// Define the route handler for /api/submit_info
router.post('/', (req, res) => {
    const { name, age, email, sex, nickname } = req.body;
    if (!name || !age) {
        return res.status(400).json({ message: '이름과 나이를 모두 제공해야 합니다.' });
    }

    connection.query('INSERT INTO User_Info (Name, User_Age, Email, Sex, nickname) VALUES (?, ?, ?, ?, ?)', [name, age, email, sex, nickname], function (err, results) {
        if (err) {
            console.error('DB Error:', err);
            return res.status(500).json({ error: 'DB에 저장하는 도중 오류가 발생했습니다.' });
        }
        return res.status(200).json({ message: '정보가 성공적으로 저장되었습니다.' });
    });
});

module.exports = router;
