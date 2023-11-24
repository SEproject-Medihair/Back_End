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
    const Hair_Loss_Types = ['전면탈모', '중앙탈모', '후면탈모', '탈모 아님'];
    const Scalp_Conditions = ['양호', '최상', '심각'];
    const currentDate = new Date().toISOString().split('T')[0];
    
    // 1. Hair_Loss_Type에 Hair_Loss_Types 중 하나를 랜덤으로 설정
    const Hair_Loss_Type = Hair_Loss_Types[Math.floor(Math.random() * Hair_Loss_Types.length)];

    // 2. '탈모 아님'이라면 Hair_Density와 Scalp_Condition 설정
    let Hair_Density, Hair_Thickness, Scalp_Condition;
    if (Hair_Loss_Type === '탈모 아님') {
        Hair_Density = 40;
        Hair_Thickness = 120;
        Scalp_Condition = '최상';
    } else {
        // 3. '전면탈모', '중앙탈모', '후면탈모' 중 하나라면 Scalp_Condition 설정
        Scalp_Condition = Scalp_Conditions[Math.floor(Math.random() * Scalp_Conditions.length)];

        // 4. Scalp_Condition이 '양호'라면 Hair_Density와 Hair_Thickness 설정
        if (Scalp_Condition === '양호') {
            Hair_Density = Math.floor(Math.random() * 11) + 20; // 20~30 사이의 랜덤 값
            Hair_Thickness = Math.floor(Math.random() * 21) + 50; // 50~70 사이의 랜덤 값
        }
        
        // 5. Scalp_Condition이 '심각'이라면 Hair_Density와 Hair_Thickness 설정
        else if (Scalp_Condition === '심각') {
            Hair_Density = Math.floor(Math.random() * 10) + 10; // 10~19 사이의 랜덤 값
            Hair_Thickness = Math.floor(Math.random() * 20) + 30; // 30~49 사이의 랜덤 값
        }
    }
    const tHair_Density  = Hair_Density;
    const tHair_Thickness = Hair_Thickness;
    const tScalp_Condition = Scalp_Condition;
    const email = req.body.email;


    connection.query('INSERT INTO Hair_history (Hair_Density,Hair_Thickness,Hair_Loss_Type,Scalp_Condition,Hair_Age, Date, U_email) VALUES (?,?,?,?,?,?,?) ', [  tHair_Density,tHair_Thickness,Hair_Loss_Type,tScalp_Condition,25, currentDate, email ], function(err, results) {
        if(err){
            return res.status(500).send(err);
        }
    });
    
    const query = `
    SELECT *
    FROM Hair_history
    WHERE U_email = ? AND Date = ?
    ORDER BY Times DESC
    LIMIT 1;
    `;
    connection.query('SELECT Name FROM User_Info WHERE Email = ?', [email], function(err, results) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const name = String(results[0].Name);
        console.log(name);
    
        connection.query(query, [email, currentDate], (err, results) => {
            console.log(results);
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: 'No record found for given email and date.' });
            }
            const modifiedResult = results[0];
            res.status(200).json({ hairData: modifiedResult, userName: name });
        });
    });
});


module.exports = router;