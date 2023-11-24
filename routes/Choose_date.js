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
    console.log(email);
    
    const query = `
        SELECT DISTINCT Date
        FROM Hair_history
        WHERE U_email = ?
        ORDER BY Date ;
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
        console.log(datesArray);
        res.status(200).send(datesArray);
    });
});

module.exports = router;