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

    const query = `
    SELECT  Hair_Density, Hair_Thickness, Hair_Loss_Type, Scalp_Condition, Hair_Age, Date
    FROM Hair_history
    WHERE U_email = ? 
    ORDER BY Times DESC
    LIMIT 1;
    `;
    connection.query(query, [email], (err, results) => {
      if (err) {
        return res.status(500).send(err);
      }
      if (results.length === 0) {
        return res.status(404).send({ message: 'No record found for given email and date.' });
      }
      
      const modifiedResult = results[0];
      console.log(modifiedResult);
      res.status(200).send(modifiedResult);
      
  
      
    });
  
  });

module.exports = router;