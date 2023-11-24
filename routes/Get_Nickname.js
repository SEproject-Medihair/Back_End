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
    const email = req.body.email;
    connection.query('SELECT nickname FROM User_Info WHERE Email = ?', [email], function(err, results) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length > 0) {
        console.log(results)
        const nickname = String(results[0].nickname);
        res.json({ name: nickname, email: email }); // 객체로 전달
      } else {
        res.status(404).json({ message: 'No user found with the given email.' });
      }
    });
  });

module.exports = router;