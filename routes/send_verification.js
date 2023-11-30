const express = require('express');

const nodemailer = require('nodemailer');
const mysql = require('mysql');
const crypto = require('crypto');
const config = require('../config');

const router = express.Router();

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

// Add your database connection logic here

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
});



router.post('/', (req, res) => {
    const email = req.body.email;
    const verificationCode = Math.floor(1000 + Math.random() * 9000); // Generate 4-digit code

    connection.query('SELECT Password FROM Customer_Info WHERE Email = ?', [email], function(err, results) {
        if (err) throw err;
        if (results.length > 0) {
            return res.status(400).json({ message: '해당 이메일은 이미 가입되어 있습니다' });
        } else {
            connection.query('INSERT INTO Customer_Info (Email, VeriCode) VALUES (?, ?)', [email, verificationCode], function(err, results) {
                if (err) throw err;
                const mailOptions = {
                    from: 'lgaranara@gmail.com',
                    to: email,
                    subject: 'Sook Sook 인증번호',
                    text: `인증코드는 ${verificationCode}입니다.`,
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return res.status(500).json({ error: 'Error sending email' });
                    }
                    console.log("Email Sent!");
                    return res.status(200).json({ message: 'Email sent' });
                });
            });
        }
    });
});

module.exports = router;