const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mysql = require('mysql');
const config = require('../config');

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

// 라우트 경로: /api/login
router.post('/', (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = hashPassword(password);
    connection.query('SELECT * FROM Customer_Info WHERE Email = ? AND Password = ?', [email, hashedPassword], function(err, results) {
        if (err) throw err;
        console.log(results);
        console.log(req.body);
        
        if (results.length > 0) {
            connection.query('SELECT Name FROM User_Info WHERE Email = ?', [email], function(err, nameResults) {
                if(err) throw err;

                if(nameResults.length > 0) {
                    //const userEmailFromSession = req.session.userEmail;

                    // 이름이 있다면
                    return res.status(200).json({
                        message: '로그인에 성공하셨습니다',
                        email: results[0].Email 
                    });
                } else {
                    // 이름이 없다면
                    const userEmailFromSession = req.body.userEmail;

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

module.exports = router;