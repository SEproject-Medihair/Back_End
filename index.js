const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const crypto = require('crypto');
const config = require('./config');

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

var connection = mysql.createConnection({
    host: config.database.host,
    port: config.database.port,
    user: config.database.user,
    password: config.database.password,
    database: config.database.database
});

connection.connect(function(err) {
    if (err) {
        console.error('Error connecting to database:', err.stack);
        return;
    }
    console.log('Connected to database as id ' + connection.threadId);
});

const app = express();
const PORT = 8080;

app.use(bodyParser.json());

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email.user,
        pass: config.email.pass,
    },
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = hashPassword(password);
    connection.query('SELECT * FROM Customer_Info WHERE Email = ? AND Password = ?', [email, hashedPassword], function(err, results) {
        if (err) throw err;
        console.log(results);
        console.log(req.body);
        
        if (results.length > 0) {
            connection.query('SELECT Name FROM User_Hair WHERE Email = ?', [email], function(err, nameResults) {
                if(err) throw err;

                if(nameResults.length > 0) {
                    // 이름이 있다면
                    return res.status(200).json({
                        message: '로그인에 성공하셨습니다',
                        email: results[0].Email 
                    });
                } else {
                    // 이름이 없다면
                    return res.status(300).json({
                        message: '로그인에 성공하셨습니다',
                        email: results[0].Email 
                    });
                }
            });
        } else {
            return res.status(400).json({ message: '비밀번호가 틀렸습니다.' });
        }
    });
});


app.post('/api/send_verification', (req, res) => {
    const email = req.body.email;
    const verificationCode = Math.floor(1000 + Math.random() * 9000); // 인증코드 생성

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
                    subject: '메디헤어 인증번호',
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

app.post('/api/submit_info', (req, res) => {
    const { name, age, email } = req.body;
    if (!name || !age) {
        return res.status(400).json({ message: '이름과 나이를 모두 제공해야 합니다.' });
    }

    connection.query('INSERT INTO User_Hair (Name, User_Age, Email) VALUES (?, ?,?) ON DUPLICATE KEY UPDATE Name = VALUES(Name), User_Age = VALUES(User_Age)', [name, age,email], function (err, results) {
        if (err) {
            console.error('DB Error:', err);
            return res.status(500).json({ error: 'DB에 저장하는 도중 오류가 발생했습니다.' });
        }

        
        connection.query('INSERT INTO User_Hair (Name, User_Age, Email) VALUES (?, ?,?) ON DUPLICATE KEY UPDATE Name = VALUES(Name), User_Age = VALUES(User_Age)', [name, age, email], function (err2, results2) {
            if (err2) {
                console.error('DB Error:', err2);
                return res.status(500).json({ error: 'User_hair 테이블에 저장하는 도중 오류가 발생했습니다.' });
            }

            return res.status(200).json({ message: '정보가 성공적으로 저장되었습니다.' });
        });
    });
});

app.post('/api/verify_code', (req, res) => {
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

app.post('/api/register', (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = hashPassword(password);
    connection.query('UPDATE Customer_Info SET Password = ? WHERE Email = ?', [hashedPassword, email], function(err, results) {
        if (err) throw err;
        return res.status(200).json({ message: '회원가입 완료' });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
