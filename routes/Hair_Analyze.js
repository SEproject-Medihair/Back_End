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
    const Condition = req.body.one;
    const Hair_skin = req.body.two;

    const currentDate = new Date().toISOString().split('T')[0];
    let Hair_Density, Hair_Thickness, Scalp_Condition;

    let t_Hair_Loss_Type;
    if(Condition == 0){
        t_Hair_Loss_Type = '탈모 아님';
        Hair_Density = 40;
        Hair_Thickness = 120;
        Scalp_Condition = '안전';
    } else if(Condition == 1){ //81~100, 22~30
        t_Hair_Loss_Type = '경증 탈모';
        Scalp_Condition = '양호';
        if(Hair_skin == 0){
            Hair_Thickness = Math.floor(Math.random() * 5) + 95;
            Hair_Density = Math.floor(Math.random() * 2) + 28;
        }else if(Hair_skin == 1){
            Hair_Thickness = Math.floor(Math.random() * 5) + 90;
            Hair_Density = Math.floor(Math.random() * 2) + 26;
        }else if(Hair_skin == 2){
            Hair_Thickness = Math.floor(Math.random() * 5) + 85;
            Hair_Density = Math.floor(Math.random() * 2) + 24;
        } else{
            Hair_Thickness = Math.floor(Math.random() * 5) + 80;
            Hair_Density = Math.floor(Math.random() * 2) + 22;
        }

    } else if(Condition == 2){ //61~80, 14~21
        t_Hair_Loss_Type = '중경증 탈모';
        Scalp_Condition = '위험';
        if(Hair_skin == 0){
            Hair_Thickness = Math.floor(Math.random() * 5) + 75;
            Hair_Density = Math.floor(Math.random() * 2) + 20;
        }else if(Hair_skin == 1){
            Hair_Thickness = Math.floor(Math.random() * 5) + 70;
            Hair_Density = Math.floor(Math.random() * 2) + 18;
        }else if(Hair_skin == 2){
            Hair_Thickness = Math.floor(Math.random() * 5) + 65;
            Hair_Density = Math.floor(Math.random() * 2) + 16;
        } else{
            Hair_Thickness = Math.floor(Math.random() * 5) + 60;
            Hair_Density = Math.floor(Math.random() * 2) + 14;
        }
        
    } else{ //40~59, 6~13
        t_Hair_Loss_Type = '중증 탈모';
        Scalp_Condition = '심각';
        if(Hair_skin == 0){
            Hair_Thickness = Math.floor(Math.random() * 5) + 55;
            Hair_Density = Math.floor(Math.random() * 2) + 12;
        }else if(Hair_skin == 1){
            Hair_Thickness = Math.floor(Math.random() * 5) + 50;
            Hair_Density = Math.floor(Math.random() * 2) + 10;
        }else if(Hair_skin == 2){
            Hair_Thickness = Math.floor(Math.random() * 5) + 45;
            Hair_Density = Math.floor(Math.random() * 2) + 8;
        } else{
            Hair_Thickness = Math.floor(Math.random() * 5) + 40;
            Hair_Density = Math.floor(Math.random() * 2) + 6;
        }
    }


    const tHair_Density  = Hair_Density;
    const tHair_Thickness = Hair_Thickness;
    const tScalp_Condition = Scalp_Condition;
    const Hair_Loss_Type = t_Hair_Loss_Type;
    


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
