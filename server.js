const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
 
const app = express();
 
const config = {
    user: 'Supergodgruppe13',
    password: 'Dengodekode13',
    server: 'eksamendb13.database.windows.net',
    database: 'eksamensprojekt',
    options: {
        encrypt: true,
        enableArithAbort: true
    }
};
 
// Middleware
app.use(express.static('public')); // Serve static files
app.use(bodyParser.json()); // Parse JSON bodies
app.use(session({
    secret: 'Jegelskermitarbejde1',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // use true if you are on HTTPS
}));
 
// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});
 
app.post('/create-user', async (req, res) => {
    const { username, password } = req.body;
 
    if (!username.includes('@') || password.length < 10 || !/[A-Z]/.test(password)) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed. Username must include "@" and password must be at least 10 characters long including an uppercase letter.'
        });
    }
 
    try {
        let pool = await sql.connect(config);
        const userCheck = await pool.request()
            .input('Username', sql.VarChar, username)
            .query('SELECT * FROM Users WHERE Username = @Username');
 
        if (userCheck.recordset.length > 0) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }
 
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.request()
            .input('Username', sql.VarChar, username)
            .input('Password', sql.VarChar, hashedPassword)
            .query('INSERT INTO Users (Username, Password) VALUES (@Username, @Password)');
 
        res.json({ success: true, message: 'User created successfully' });
    } catch (err) {
        console.error('Database operation failed:', err);
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
});
 
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        let pool = await sql.connect(config);
        const result = await pool.request()
            .input('Username', sql.VarChar, username)
            .query('SELECT * FROM Users WHERE Username = @Username');
 
        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
 
        const user = result.recordset[0];
        const passwordMatch = await bcrypt.compare(password, user.Password);
        // Gemmer brugeren i session, så vi ved hvilken bruger der er logget ind.
        // Vi kan hente userID på req.session.user.userId og username på req.session.user.username
        if (passwordMatch) {
            req.session.user = {
                username,
                userId: user.UserID
            };  
            res.json({ success: true, message: 'Logged in successfully' });
        } else {
            res.status(401).json({ success: false, message: 'Incorrect password' });
        }
    } catch (err) {
        console.error('Login failed:', err);
        res.status(500).json({ success: false, message: 'Login process failed', error: err.message });
    }
});
 
app.post('/update-user', async (req, res) => {
    if (!req.session.user.username) {
        return res.status(401).json({ success: false, message: 'No user logged in' });
    }
 
    const { weight, age, sex } = req.body;
    const username = req.session.user.username;
 
    try {
        let pool = await sql.connect(config);
        const result = await pool.request()
            .input('Username', sql.VarChar, username)
            .input('Weight', sql.Decimal, weight)
            .input('Age', sql.Int, age)
            .input('Sex', sql.VarChar, sex)
            .query('UPDATE Users SET Weight = @Weight, Age = @Age, Sex = @Sex WHERE Username = @Username');
 
        if (result.rowsAffected[0] > 0) {
            res.json({ success: true, message: 'Profile updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error('Update failed:', err);
        res.status(500).json({ success: false, message: 'Update process failed', error: err.message });
    }
});
 
app.post('/delete-user', async (req, res) => {
    if (!req.session.user.username) {
        return res.status(401).json({ success: false, message: 'No user logged in' });
    }
 
    const username = req.session.user.username;
 
    try {
        let pool = await sql.connect(config);
        const result = await pool.request()
            .input('Username', sql.VarChar, username)
            .query('DELETE FROM Users WHERE Username = @Username');
 
        if (result.rowsAffected[0] > 0) {
            req.session.destroy(); // Destroying the session after deleting the user
            res.json({ success: true, message: 'User deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error('Delete failed:', err);
        res.status(500).json({ success: false, message: 'Delete process failed', error: err.message });
    }
});
 
// Get User Profile Information – Weight, Age, Sex Til at blive vist på når man er logget ind
app.get('/get-user-info', async (req, res) => {
    if (!req.session || !req.session.user.username) {
        return res.status(401).json({ success: false, message: 'No user logged in' });
    }
 
    try {
        let pool = await sql.connect(config);
        const username = req.session.user.username;
 
        const result = await pool.request()
            .input('Username', sql.VarChar, username)
            .query('SELECT Username, Weight, Age, Sex FROM Users WHERE Username = @Username');
 
        if (result.recordset.length > 0) {
            const userInfo = result.recordset[0];
            res.json({ success: true, data: userInfo });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error('Database operation failed:', err);
        res.status(500).json({ success: false, message: 'Failed to retrieve user info', error: err.message });
    }
});
 
// muliggør det at brugeren laver et måltid ud fra ingredienser i databasen (route)
///////// NUVÆRENDE TEST SOM VIRKER MED AT INDHENTE DATA FRA DATABASEN! ////////////
 
app.get("/:name", async (req, res) => {
    let name = req.params.name;
    try {
        let pool = await sql.connect(config);
        const userCheck = await pool.request()
            .input('FoodName', sql.NVarChar, `%${name}%`)
            .query('SELECT FoodName FROM DataFood WHERE FoodName LIKE @FoodName');
        res.json(userCheck.recordset);
    } catch (err) {
        console.error('Database query failed:', err);
        res.status(500).send('Database query error');
    }
});
 
///////// GØR DET MULIGT AT LAVE ET MÅLTID OG INDSÆTTE DET I DATABASEN ////////////
 
app.post('/create-meal', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'No user logged in' });
    }
 
    const { mealName, ingredients } = req.body;
    const userId = req.session.user.userId;
 
    try {
        let pool = await sql.connect(config);
        const insertMealResult = await pool.request()
            .input('MealName', sql.NVarChar, mealName)
            .input('UserID', sql.Int, userId)
            .query('INSERT INTO Meals (MealName, UserID) OUTPUT INSERTED.MealID VALUES (@MealName, @UserID)');
 
        const mealId = insertMealResult.recordset[0].MealID;
 
        // Initialize macro totals
        let totalKCal = 0, totalProtein = 0, totalFat = 0, totalFiber = 0;
 
        for (const ingredient of ingredients) {
            const ingredientResult = await pool.request()
                .input('FoodName', sql.NVarChar, ingredient.name)
                .query('SELECT FoodID, KCal, Protein, Fat, Fiber FROM DataFood WHERE FoodName = @FoodName');
 
            if (ingredientResult.recordset.length > 0) {
                const { FoodID, KCal, Protein, Fat, Fiber } = ingredientResult.recordset[0];
                const quantity = parseFloat(ingredient.quantity);
 
                // Calculate macros for the ingredient
                totalKCal += (KCal * quantity) / 100;
                totalProtein += (Protein * quantity) / 100;
                totalFat += (Fat * quantity) / 100;
                totalFiber += (Fiber * quantity) / 100;
 
                await pool.request()
                    .input('MealID', sql.Int, mealId)
                    .input('FoodID', sql.Int, FoodID)
                    .input('Quantity', sql.Decimal, quantity)
                    .query('INSERT INTO MealIngredients (MealID, FoodID, Quantity) VALUES (@MealID, @FoodID, @Quantity)');
            }
        }
 
        // Update the Meals table with the total macros
        await pool.request()
            .input('MealID', sql.Int, mealId)
            .input('TotalCalories', sql.Decimal, totalKCal)
            .input('TotalProtein', sql.Decimal, totalProtein)
            .input('TotalFat', sql.Decimal, totalFat)
            .input('TotalFiber', sql.Decimal, totalFiber)
            .query('UPDATE Meals SET TotalCalories = @TotalCalories, TotalProtein = @TotalProtein, TotalFat = @TotalFat, TotalFiber = @TotalFiber WHERE MealID = @MealID');
 
        res.json({
            success: true,
            message: 'Meal created successfully',
            macros: {
                calories: totalKCal.toFixed(2),
                protein: totalProtein.toFixed(2),
                fat: totalFat.toFixed(2),
                fiber: totalFiber.toFixed(2)
            }
        });
    } catch (err) {
        console.error('Meal creation failed:', err);
        res.status(500).json({ success: false, message: 'Meal creation failed', error: err.message });
    }
});
 
//////////////////////////////////////////////////////////////////////////////////////////////////
 
// Endpoint to search for ingredient information
app.get('/search-ingredient-info/:name', async (req, res) => {
    let name = req.params.name;
    try {
        let pool = await sql.connect(config);
        const results = await pool.request()
            .input('FoodName', sql.NVarChar, `%${name}%`)
            .query('SELECT FoodName, FoodID FROM InformationFood WHERE FoodName LIKE @FoodName');
        res.json(results.recordset);
    } catch (err) {
        console.error('Database query failed:', err);
        res.status(500).send('Database query error');
    }
});
 
// Endpoint to get detailed information for a specific ingredient
app.get('/get-ingredient-info/:id', async (req, res) => {
    let id = req.params.id;
    try {
        let pool = await sql.connect(config);
        const results = await pool.request()
            .input('FoodID', sql.Int, id)
            .query('SELECT FoodName, FoodID, TaxonomicName, FoodGroup, KCal, Protein, Fat, Fiber FROM DataFood WHERE FoodID = @FoodID');
        res.json(results.recordset);
    } catch (err) {
        console.error('Database query failed:', err);
        res.status(500).send('Database query error');
    }
});
 
 
//
//AKTIVITETS TRACKER stine arbejder på den
app.get('/activity-types', async (req, res) => {
    try {
        // Åben en ny forbindelse ved hjælp af SQL Server-konfiguration
        await sql.connect(config);

        // Udfører en simpel SQL-forespørgsel for at hente alle aktivitetstyper
        const result = await sql.query('SELECT * FROM ActivityTypes');

        console.log(result)
        // Send resultaterne tilbage til klienten
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Error on the server.');
    }
});

// Stine tester
// Vigtigt at det her er req.session.user.userID
app.post('/add-activity', async (req, res) => {
    if (!req.session || !req.session.user.userId) {
        return res.status(401).send('Bruger er ikke logget ind');
    }

    const { name, calories, duration, date } = req.body;
    try {
        let pool = await sql.connect(config);
        await pool.request()
            .input('UserID', sql.Int, req.session.user.userId)
            .input('ActivityName', sql.NVarChar, name)
            .input('Duration', sql.Int, duration)
            .input('CaloriesBurned', sql.Decimal(18, 0), calories)
            .input('Date', sql.Date, new Date(date))
            .query('INSERT INTO Activities (UserID, ActivityName, Duration, CaloriesBurned, Date) VALUES (@UserID, @ActivityName, @Duration, @CaloriesBurned, @Date)');

        res.send({ success: true, message: 'Aktivitet gemt' });
    } catch (err) {
        console.error('Fejl ved database operation:', err);
        res.status(500).send('Server fejl');
    }
});




// DAILY NUTRI
// route til væskeindtag og spiste måltider
app.get('/get-nutrition-data', async (req, res) => {
    if (!req.session || !req.session.user.userId) {
        return res.status(401).json({ success: false, message: 'No user logged in' });
    }

    try {
        let pool = await sql.connect(config);
        // Antag at du har en kolonne kaldet 'DateTime' i både WaterIntake og MealsEated tabellerne
        const waterIntakeResult = await pool.request()
            .input('UserID', sql.Int, req.session.user.userId)
            .query('SELECT SUM(Amount) as TotalWaterIntake, DATEPART(HOUR, IntakeDateTime) as Hour FROM WaterIntake WHERE UserID = @UserID AND IntakeDateTime >= DATEADD(day, -1, GETDATE()) GROUP BY DATEPART(HOUR, IntakeDateTime)');

        const mealCaloriesResult = await pool.request()
            .input('UserID', sql.Int, req.session.user.userId)
            .query('SELECT SUM(TotalCalories) as TotalCalories, DATEPART(HOUR, EatenDate) as Hour FROM MealsEated WHERE UserID = @UserID AND EatenDate >= DATEADD(day, -1, GETDATE()) GROUP BY DATEPART(HOUR, EatenDate)');

        res.json({
            success: true,
            waterIntake: waterIntakeResult.recordset,
            mealCalories: mealCaloriesResult.recordset
        });
    } catch (err) {
        console.error('Database operation failed:', err);
        res.status(500).json({ success: false, message: 'Failed to retrieve nutrition data', error: err.message });
    }
});



// Hav den her i bunden 
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
