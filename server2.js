// const express = require('express');
// const app = express();
// const sql = require('mssql');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt');
// const session = require('express-session');
// const path = require('path');

// const config = {
//     user: 'Supergodgruppe13',
//     password: 'Dengodekode13',
//     server: 'eksamendb13.database.windows.net',
//     database: 'eksamensprojekt',
//     options: {
//         encrypt: true,
//         enableArithAbort: true
//     }
// };


// app.post("/meal", async (req, res) => {

//     const body = req.body;


//     let pool = await sql.connect(config);
//     const userCheck = await pool.request()
//     .input('Username', sql.VarChar, username)
//     .query('INSERT INTO Users (Username) VALUES (@Username)');

    

//     if(userCheck.rowsAffected[0] > 0) {
//         res.send({ success: true });
//     } else {
//         res.send({ success: false, message: 'Brugernavn er allerede i brug' });
//     }
// })



// app.get("/:name", async (req, res) => {

//     let name = req.params.name;

//     let pool = await sql.connect(config);
//     const userCheck = await pool.request()
//     //.input('Username', sql.VarChar, username)
//     .query('SELECT * FROM DataFood');

//     const items = userCheck.recordset; // []

//     const foods = items.filter(food => food.FoodName.includes(name));

//     res.send(foods);
// })

// app.listen(3000, () => {
//     console.log('Server is running on port 3000');
// })