const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const crypto = require('crypto');
const config = require('./config');
//const session = require('express-session')
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

// app.use(session({
//     cookie: { secure: false }  // `secure: true` for production if using HTTPS
// }));

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
                    const userEmailFromSession = req.session.userEmail;

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
    const { name, age, email,sex } = req.body;
    if (!name || !age) {
        return res.status(400).json({ message: '이름과 나이를 모두 제공해야 합니다.' });
    }

    connection.query('INSERT INTO User_Info (Name, User_Age, Email, Sex) VALUES (?, ?,?, ?) ', [name, age, email, sex], function (err, results) {
        if (err) {
            console.error('DB Error:', err);
            return res.status(500).json({ error: 'DB에 저장하는 도중 오류가 발생했습니다.' });
        }
            return res.status(200).json({ message: '정보가 성공적으로 저장되었습니다.' });
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

app.post('/api/Today_condition',(req,res)=>{
    const email = req.body.email;
    const currentDate = new Date().toISOString().split('T')[0];
    console.log(email, currentDate);
  const query = `
  SELECT U_name, Hair_Density, Hair_Thickness, Hair_Loss_Type, Scalp_Condition, Hair_Age, Date
  FROM Hair_history
  WHERE U_email = ? AND Date = ?
  ORDER BY Times DESC
  LIMIT 1;
  `;

  connection.query(query, [email, currentDate], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(404).send({ message: 'No record found for given email and date.' });
    }
  
    // Date 값을 'YYYY-MM-DD' 형식으로 변환
    //const modifiedResult = { ...results[0], Date: results[0].Date.toISOString().split('T')[0] };
    const modifiedResult = results[0];

    res.status(200).send(modifiedResult);
  });
  
});

app.post('/api/Choose_date', (req, res) => {
    const email = req.body.email;
    console.log(email);
    
    const query = `
        SELECT DISTINCT Date
        FROM Hair_history
        WHERE U_email = ?
        ORDER BY Date DESC;
    `;

    connection.query(query, [email], (err, results) => {
        console.log(results);
        if (err) {
            return res.status(500).send(err);
        }
        if (results.length === 0) {
            return res.status(404).send({ message: 'No dates found for the given email.' });
        }
        
        // Date 값을 'YYYY-MM-DD' 형식으로 변환 후 배열로 전송
        //const datesArray = results.map(result => result.Date.toISOString().split('T')[0]);
        const datesArray = results.map(result => new Date(result.Date).toISOString().split('T')[0]);

        res.status(200).send(datesArray);
    });
});


app.post('/api/Choosen_date',(req,res)=>{
    const email = req.body.email;
    const currentDate = req.body.date;
    console.log(email, currentDate);
  const query = `
  SELECT U_name, Hair_Density, Hair_Thickness, Hair_Loss_Type, Scalp_Condition, Hair_Age, Date
  FROM Hair_history
  WHERE U_email = ? AND Date = ?
  ORDER BY Times DESC
  LIMIT 1;
  `;

  connection.query(query, [email, currentDate], (err, results) => {
    if (err) {
      return res.status(500).send(err);
    }
    if (results.length === 0) {
      return res.status(404).send({ message: 'No record found for given email and date.' });
    }
  
    // Date 값을 'YYYY-MM-DD' 형식으로 변환
    //const modifiedResult = { ...results[0], Date: results[0].Date.toISOString().split('T')[0] };
    const modifiedResult = results[0];

    res.status(200).send(modifiedResult);
  });
  
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
