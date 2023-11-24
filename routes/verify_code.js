const express = require('express');
const mysql = require('mysql');
const config = require('../config');
const router = express.Router();

const connection = mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
});


router.post('/', (req, res) => {
    const { email, code } = req.body;
    connection.query('SELECT * FROM Customer_Info WHERE Email = ? AND VeriCode = ?', [email, code], function(err, results) {
        if (err) throw err;
        if (results.length > 0) {
            return res.status(200).json({ isVerified: true });
        } else {
            return res.status(400).json({ message: '인증번호가 틀렸습니다' });
        }
    });
});

module.exports = router;