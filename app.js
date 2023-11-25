const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const config = require('./config');

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
const PORT = 80;

app.use(bodyParser.json());



app.get('/', (req, res) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body>
    
    <h2>API</h2>
    
    <ol>
      <li>안효성 천재</li>
      <li>장연 바보</li>
      <li>전현아 탈모</li>
      <li>박진우 천재</li>
    </ol>  
    
    </body>
    </html>
    `;
    
    res.send(htmlContent);
});
const loginRoute = require('./routes/login');
const sendVerificationRoute = require('./routes/send_verification');
const loadChatRouter = require('./routes/Load_Chat');
const submitInfoRouter = require('./routes/submit_info');
const chatSaveRouter = require('./routes/Chat_Save');
const verifyCodeRouter = require('./routes/verify_code');
const Register = require('./routes/register');
const Today_condition = require('./routes/Today_condition');
const Choose_date = require('./routes/Choose_date');
const Choosen_date = require('./routes/Choosen_date');
const Record_choice = require('./routes/Record_choice');
const Solution = require('./routes/Solution');
const Community = require('./routes/Community');
const Get_Nickname = require('./routes/Get_Nickname');
const Get_U_Name = require('./routes/Get_U_Name');
const Hair_Analyze = require('./routes/Hair_Analyze');

app.use('/api/send_verification', sendVerificationRoute);
app.use('/api/login', loginRoute);
app.use('/api/submit_info', submitInfoRouter);
app.use('/api/chat_save', chatSaveRouter);
app.use('/api/load_chat', loadChatRouter);
app.use('/api/verify_code', verifyCodeRouter);
app.use('/api/register',Register);
app.use('/api/Choose_date',Choose_date);
app.use('/api/Choosen_date',Choosen_date);
app.use('/api/Today_condition',Today_condition);
app.use('/api/Record_choice',Record_choice);
app.use('/api/Solution',Solution);
app.use('/api/Community',Community);
app.use('/api/Get_Nickname',Get_Nickname);
app.use('/api/Get_U_Name',Get_U_Name);
app.use('/api/Hair_Analyze',Hair_Analyze);
    


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
