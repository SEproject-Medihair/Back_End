const express = require('express');
const mysql = require('mysql');
const config = require('../config');
const router = express.Router();
const crypto = require('crypto');

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

const connection = mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
});

router.post('/', (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = hashPassword(password);
    connection.query('UPDATE Customer_Info SET Password = ? WHERE Email = ?', [hashedPassword, email], function(err, results) {
        if (err) throw err;
        return res.status(200).json({ message: '회원가입 완료' });
    });
});

module.exports = router;