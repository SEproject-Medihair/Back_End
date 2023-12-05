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
        Hair_Density = 130;
        Hair_Thickness = 120;
        Scalp_Condition = '안전';
    } else if(Condition == 1){ //81~100, 75~94
        t_Hair_Loss_Type = '경증 탈모';
        Scalp_Condition = '양호';
        if(Hair_skin == 0){
            Hair_Thickness = Math.floor(Math.random() * 5) + 95;
            Hair_Density = Math.floor(Math.random() * 5) + 90;
        }else if(Hair_skin == 1){
            Hair_Thickness = Math.floor(Math.random() * 5) + 90;
            Hair_Density = Math.floor(Math.random() * 5) + 85;
        }else if(Hair_skin == 2){
            Hair_Thickness = Math.floor(Math.random() * 5) + 85;
            Hair_Density = Math.floor(Math.random() * 5) + 80;
        } else{
            Hair_Thickness = Math.floor(Math.random() * 5) + 80;
            Hair_Density = Math.floor(Math.random() * 5) + 75;
        }

    } else if(Condition == 2){ //61~80, 55~74
        t_Hair_Loss_Type = '중경증 탈모';
        Scalp_Condition = '위험';
        if(Hair_skin == 0){
            Hair_Thickness = Math.floor(Math.random() * 5) + 75;
            Hair_Density = Math.floor(Math.random() * 5) + 70;
        }else if(Hair_skin == 1){
            Hair_Thickness = Math.floor(Math.random() * 5) + 70;
            Hair_Density = Math.floor(Math.random() * 5) + 65;
        }else if(Hair_skin == 2){
            Hair_Thickness = Math.floor(Math.random() * 5) + 65;
            Hair_Density = Math.floor(Math.random() * 5) + 60;
        } else{
            Hair_Thickness = Math.floor(Math.random() * 5) + 60;
            Hair_Density = Math.floor(Math.random() * 5) + 55;
        }
        
    } else{ //40~59, 35~54
        t_Hair_Loss_Type = '중증 탈모';
        Scalp_Condition = '심각';
        if(Hair_skin == 0){
            Hair_Thickness = Math.floor(Math.random() * 5) + 55;
            Hair_Density = Math.floor(Math.random() * 5) + 50;
        }else if(Hair_skin == 1){
            Hair_Thickness = Math.floor(Math.random() * 5) + 50;
            Hair_Density = Math.floor(Math.random() * 5) + 45;
        }else if(Hair_skin == 2){
            Hair_Thickness = Math.floor(Math.random() * 5) + 45;
            Hair_Density = Math.floor(Math.random() * 5) + 40
        } else{
            Hair_Thickness = Math.floor(Math.random() * 5) + 40;
            Hair_Density = Math.floor(Math.random() * 5) + 35
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
