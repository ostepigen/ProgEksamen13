require('dotenv').config({ path: './.env.development' });
const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const config = require('./config');

const app = express();

// Middleware 
app.use(express.static('public')); // Behandler statiske filer fra public mappen
app.use(bodyParser.json()); // Anvender body-parser til at parse JSON i request body
app.use(session({
    secret: 'Jegelskermitarbejde1',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

// Funktion til at sikre, at brugeren er logget ind
function checkLogin(req, res, next) {
    if (!req.session.user) {
        res.redirect('/');// Omdirigerer til login, hvis ikke logget ind
    } else {
        next(); 
    }
}

// Definerer ruter for at tilgå HTML-sider, der kræver login
const pages = [
    'mealcreator.html', 'mealtracker.html', 'dailynutri.html',
    'activityTracker.html', 'profile.html'
];

// Loop igennem hver side i arrayet og tilføj en rute
pages.forEach(page => {
    app.get(`/${page}`, checkLogin, (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'html', page));
    });
});

// Rute til at logge ud og afslutte sessionen
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            res.status(500).send("Failed to logout.");
        } else {
            res.redirect('/public/html/login.html');
        }
    });
});


//////////// EKSTRA FUNKTIONER TIL MEALTRACKEREN //////////////
// Route til at registrere væskeindtag
app.post('/water-intake', async (req, res) => {

    // Tjekker om brugeren er logget ind
    if (!req.session.user || !req.session.user.username) {
        return res.status(401).send('Not logged in');
    }

    console.log('User ID:', req.session.user.userId);  // Logger brugerens ID

    // Henter væskenavn og mængde fra anmodningens body
    const { liquidName, amount } = req.body;
    try {
        const pool = await sql.connect(config);  // Forbinder til databasen
        // Udfører SQL-anmodning for at tilføje data
        await pool.request()
            .input('UserID', sql.Int, req.session.user.userId)
            .input('LiquidName', sql.NVarChar, liquidName)
            .input('Amount', sql.Int, amount)
            .query('INSERT INTO WaterIntake (UserID, LiquidName, Amount) VALUES (@UserID, @LiquidName, @Amount)');

        // Svarer med succesmeddelelse
        res.status(200).json({ success: true, message: 'Water intake recorded successfully' });
    } catch (err) {
        console.error('Database operation failed:', err);  // Logger databasens fejl
        res.status(500).json({ success: false, message: 'Failed to record water intake', error: err.message });
    }
});

// Route til at hente alle brugerens væskeindtagsposter
app.get('/water-intaken', async (req, res) => {
    if (!req.session.user.userId) {
        return res.status(401).send('Not logged in');
    }
    console.log('User ID:', req.session.user.userId);  // Logger brugerens ID
    try {
        const pool = await sql.connect(config);  // Forbinder til databasen
        const result = await pool.request()
            .input('UserID', sql.Int, req.session.user.userId)
            .query('SELECT LiquidName, Amount, IntakeDateTime, WaterIntakeId FROM WaterIntake WHERE UserID = @UserID ORDER BY IntakeDateTime DESC');

        // Sender data som JSON
        res.status(200).json(result.recordset);

    } catch (err) {
        console.error('Database operation failed:', err); 
        res.status(500).send('Failed to get water intake records');
    }
});

// Route til at slette et væskeindtagspost
app.delete('/water-intake/:waterIntakeId', async (req, res) => {
    const waterIntakeId = parseInt(req.params.waterIntakeId, 10);  // Parser ID fra URL
    if (isNaN(waterIntakeId)) {
        return res.status(400).send('Invalid Water Intake ID');
    }

    try {
        const pool = await sql.connect(config);  // Forbinder til databasen
        const result = await pool.request()
            .input('WaterIntakeId', sql.Int, waterIntakeId)
            .query('DELETE FROM WaterIntake WHERE WaterIntakeId = @WaterIntakeId');

        if (result.rowsAffected[0] > 0) {
            res.json({ success: true, message: 'Water intake deleted successfully' });  
        } else {
            res.status(404).send('Water intake record not found');  
        }
    } catch (err) {
        console.error('Database operation failed:', err); 
        res.status(500).send('Failed to delete water intake');
    }
});


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////



/////////////////// ACTIVITY TRACKER  ///////////////////
//Henter aktivitetstyperne. Bruges i acitvityTracker.js
app.get('/activity-types', async (req, res) => {
    try {
        // Åben en ny forbindelse ved hjælp af SQL Server-konfiguration
        await sql.connect(config);

        // Henter alle rækker fra tabellen med aktivitetstyper
        const result = await sql.query('SELECT * FROM ActivityTypesNy');

        // Sender dataene tilbage til klienten som json
        res.json(result.recordset);
    } catch (err) {
        console.error('SQL error', err);
        res.status(500).send('Error on the server.');
    }
});

// Tilføjer aktivitet til brugeren
app.post('/add-activity', async (req, res) => {
    if (!req.session || !req.session.user.userId) {
        return res.status(401).send('User not logged in');
    }
    //Dataen der er sendt fra brugeren gemmes 
    const { name, calories, duration, date, activityTypeID } = req.body;
    try {
        //Der bliver oprettet en forbindelse til databasen
        let pool = await sql.connect(config);
        await pool.request()
            //Sikrer at dataen er korrekt og beskytter vores SQL (validering)
            .input('UserID', sql.Int, req.session.user.userId)
            .input('ActivityName', sql.NVarChar, name)
            .input('Duration', sql.Int, duration)
            .input('CaloriesBurned', sql.Decimal(18, 0), calories)
            .input('Date', sql.DateTime, new Date(date))
            .input('ActivityTypeID', sql.Int, activityTypeID)
            //Aktiviteterne sættes ind i databasen 
            .query('INSERT INTO Activities (UserID, ActivityName, Duration, CaloriesBurned, Date, ActivityTypeID) VALUES (@UserID, @ActivityName, @Duration, @CaloriesBurned, @Date, @ActivityTypeID)');

        //Bekræfter at dataen er gemt 
        res.send({ success: true, message: 'Aktiviteten er gemt' });
    } catch (err) {
        console.error('Database operation error:', err);
        res.status(500).send('Server error');
    }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////// BRUGER STYRING ///////////////////
//Enpoint til opret bruger. Bliver brugt i login.js
app.post('/create-user', async (req, res) => {
    //Henter brugernavn og kodeord fra request body
    const { username, password } = req.body;
    //Validerer brugernavn og kodeord. Skal indeholde @, være min 10 lang og have et stort bogstav
    if (!username.includes('@') || password.length < 10 || !/[A-Z]/.test(password)) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed. Username must include "@" and password must be at least 10 characters long including an uppercase letter.'
        });
    }

    try {
        //Opretter forbindelse til databasen
        let pool = await sql.connect(config);
        const userCheck = await pool.request()
            //Indsætter brugernavnet i SQL forespørgselen
            .input('Username', sql.VarChar, username)
            //Henter brugeren baseret på brugernavn
            .query('SELECT * FROM Users WHERE Username = @Username');

        //Tjekker om brugeren allerede findes
        if (userCheck.recordset.length > 0) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        //Hasher kodeordet før vi gemmer det
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

//Endpoint til login. Bruges i login.js
app.post('/login', async (req, res) => {
    //Henter brugernavn og kodeord fra request body
    const { username, password } = req.body;
    try {
        //Opretter forbindelse til databasen
        let pool = await sql.connect(config);
        const result = await pool.request()
            .input('Username', sql.VarChar, username)
            .query('SELECT * FROM Users WHERE Username = @Username');

        //Tjekker om brugeren findes
        if (result.recordset.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = result.recordset[0];
        //Sammenligner indtastet kodeord med hashet kodeord i databasen
        const passwordMatch = await bcrypt.compare(password, user.Password);

        //Gemmer brugeren i session, så vi ved hvilken bruger der er logget ind.
        //Vi kan hente userID på req.session.user.userId og username på req.session.user.username
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

// Endpoint til at opdaterer brugeroplysninger
app.post('/update-user', async (req, res) => {
    if (!req.session.user.username) {
        return res.status(401).json({ success: false, message: 'No user logged in' });
    }

    const { weight, age, sex } = req.body;
    const username = req.session.user.username;
    // Funktion til beregning af basalforbrænding indlejret direkte i ruten
    function beregnBasaltStofskifte(weight, age, sex) {
        let mjBasalstofskifte;
        if (sex === 'Woman') {
            if (age < 3) mjBasalstofskifte = 0.244 * weight + 0.13;
            else if (age <= 10) mjBasalstofskifte = 0.085 * weight + 2.03;
            else if (age <= 18) mjBasalstofskifte = 0.056 * weight + 2.9;
            else if (age <= 30) mjBasalstofskifte = 0.0615 * weight + 2.08;
            else if (age <= 60) mjBasalstofskifte = 0.0364 * weight + 3.47;
            else if (age <= 75) mjBasalstofskifte = 0.0386 * weight + 2.88;
            else mjBasalstofskifte = 0.0410 * weight + 2.61;
        } else if (sex === 'Man') {
            if (age < 3) mjBasalstofskifte = 0.249 * weight - 0.13;
            else if (age <= 10) mjBasalstofskifte = 0.095 * weight + 2.11;
            else if (age <= 18) mjBasalstofskifte = 0.074 * weight + 2.75;
            else if (age <= 30) mjBasalstofskifte = 0.064 * weight + 2.84;
            else if (age <= 60) mjBasalstofskifte = 0.0485 * weight + 3.67;
            else if (age <= 75) mjBasalstofskifte = 0.0499 * weight + 2.93;
            else mjBasalstofskifte = 0.035 * weight + 3.43;
        }
        // Konvertering til kalorier
        let kalorier = mjBasalstofskifte * 239;
        return kalorier.toFixed(2); // Returnerer værdien afrundet til to decimaler

    }

    const basalForbrænding = beregnBasaltStofskifte(weight, age, sex);

    try {
        let pool = await sql.connect(config);
        const result = await pool.request()
            .input('Username', sql.VarChar, username)
            .input('Weight', sql.Decimal, weight)
            .input('Age', sql.Int, age)
            .input('Sex', sql.VarChar, sex)
            .input('Basalforbrændning', sql.Decimal, basalForbrænding)
            .query('UPDATE Users SET Weight = @Weight, Age = @Age, Sex = @Sex, Basalforbrændning = @Basalforbrændning WHERE Username = @Username');

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

// Route til at slette en brugers profil
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
            req.session.destroy(); // Afslutter sessionen efter brugeren er slettet
            res.json({ success: true, message: 'User deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (err) {
        console.error('Delete failed:', err);
        res.status(500).json({ success: false, message: 'Delete process failed', error: err.message });
    }
});

// Route til at hente brugerprofiloplysninger – Weight, Age, Sex Til at blive vist på når man er logget ind
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


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////


/////////////////// MEAL CREATOR ///////////////////
//Enpoint til at søge efter ingrediens ud fra navnet 
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

// muliggør det at brugeren laver et måltid ud fra ingredienser i databasen
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

        //Initialiser makroer
        let totalKCal = 0, totalProtein = 0, totalFat = 0, totalFiber = 0;

        for (const ingredient of ingredients) {
            const ingredientResult = await pool.request()
                .input('FoodName', sql.NVarChar, ingredient.name)
                .query('SELECT FoodID, KCal, Protein, Fat, Fiber FROM DataFood WHERE FoodName = @FoodName');

            if (ingredientResult.recordset.length > 0) {
                const { FoodID, KCal, Protein, Fat, Fiber } = ingredientResult.recordset[0];
                const quantity = parseFloat(ingredient.quantity);

                // Beregner makronæringsstoffer for ingrediensen
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

        //Opdater Meals-tabellen med de totale makronæringsstoffer
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

//Endpoint til at søge efter fødevare
app.get('/search-ingredient-info/:name', async (req, res) => {
    let name = req.params.name;
    try {
        let pool = await sql.connect(config);
        const results = await pool.request()
            .input('FoodName', sql.NVarChar, `%${name}%`)
            .query('SELECT FoodName, FoodID, Kcal FROM DataFood WHERE FoodName LIKE @FoodName');
        res.json(results.recordset);
    } catch (err) {
        console.error('Database query failed:', err);
        res.status(500).send('Database query error');
    }
});


//Endpoint for at få detaljerede oplysninger om en specifik ingrediens ved ID
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

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/////////////////// MEAL TRACKER ///////////////////
// Endpoint til at slette et måltid
app.delete('/api/delete-meal-eaten/:mealEatenId', async (req, res) => {
    if (!req.session || !req.session.user || !req.session.user.userId) {
        console.log("Session or user ID not found in session:", req.session);
        return res.status(401).send('User not logged in');
    }

    const { mealEatenId } = req.params;
    console.log("Attempting to delete meal with MealEatenId:", mealEatenId, " for user:", req.session.user.userId);

    try {
        await sql.connect(config);
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('MealEatenId', sql.Int, mealEatenId)
            .input('UserID', sql.Int, req.session.user.userId)
            .query('DELETE FROM MealsEaten WHERE MealEatenId = @MealEatenId AND UserId = @UserID');

        if (result.rowsAffected[0] > 0) {
            console.log("Meal successfully deleted:", result.rowsAffected);
            res.status(200).json({ success: true, message: 'Logged meal deleted successfully' });
        } else {
            console.log("No rows affected, possible incorrect ID or user mismatch");
            res.status(404).send('Logged meal not found or user mismatch');
        }
    } catch (err) {
        console.error('Database operation failed:', err);
        res.status(500).send('Failed to delete logged meal');
    }
});

//Endpoint til fetch af brugerens måltider
app.get('/api/meals', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).send('User not logged in');
    }

    const userId = req.session.user.userId;
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('UserID', sql.Int, userId)
            .query('SELECT MealID, MealName FROM Meals WHERE UserID = @UserID ORDER BY MealID DESC');

        if (result.recordset.length > 0) {
            res.json(result.recordset);
        } else {
            res.status(404).send('No meals found');
        }
    } catch (err) {
        console.error('Error retrieving meals from database:', err);
        res.status(500).send('Error retrieving meals from database');
    }
});

////////// EDIT MEALS /////////
//Bruges i mealLogger.js
app.patch('/api/update-meal-eaten/:mealEatenId', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('User not logged in');
    }

    const { mealEatenId } = req.params;
    const { newWeight } = req.body;

    if (!newWeight || newWeight <= 0) {
        return res.status(400).send('Invalid weight provided');
    }

    try {
        const pool = await sql.connect(config);

        const mealDetails = await pool.request()
            .input('MealEatenId', sql.Int, mealEatenId)
            .query('SELECT TotalCalories, TotalProtein, TotalFat, TotalFiber, Weight FROM MealsEaten WHERE MealEatenId = @MealEatenId');

        if (mealDetails.recordset.length === 0) {
            return res.status(404).send('Meal not found');
        }

        const meal = mealDetails.recordset[0];
        const factor = newWeight / meal.Weight;

        //Regner makroer 
        const newCalories = meal.TotalCalories * factor;
        const newProtein = meal.TotalProtein * factor;
        const newFat = meal.TotalFat * factor;
        const newFiber = meal.TotalFiber * factor;

        //Opdaterer vægt og maskroer
        await pool.request()
            .input('MealEatenId', sql.Int, mealEatenId)
            .input('NewWeight', sql.Decimal(10, 2), newWeight)
            .input('NewCalories', sql.Decimal(10, 2), newCalories)
            .input('NewProtein', sql.Decimal(10, 2), newProtein)
            .input('NewFat', sql.Decimal(10, 2), newFat)
            .input('NewFiber', sql.Decimal(10, 2), newFiber)
            .query('UPDATE MealsEaten SET Weight = @NewWeight, TotalCalories = @NewCalories, TotalProtein = @NewProtein, TotalFat = @NewFat, TotalFiber = @NewFiber WHERE MealEatenId = @MealEatenId');

        res.status(200).json({ success: true, message: 'Meal updated successfully' });
    } catch (err) {
        console.error('Database operation failed:', err);
        res.status(500).send('Failed to update meal');
    }
});

// Endpoint til at logge et måltid
app.post('/api/log-meal', async (req, res) => {
    const { mealId, weight, location } = req.body;

    try {
        const pool = await sql.connect(config);
        const mealMacros = await pool.request()
            .input('MealID', sql.Int, mealId)
            .query('SELECT TotalCalories, TotalProtein, TotalFat, TotalFiber FROM Meals WHERE MealID = @MealID');

        if (mealMacros.recordset.length === 0) {
            return res.status(404).send('Meal not found');
        }

        const macros = mealMacros.recordset[0];
        const factor = weight / 100.0;

        const calories = macros.TotalCalories * factor;
        const protein = macros.TotalProtein * factor;
        const fat = macros.TotalFat * factor;
        const fiber = macros.TotalFiber * factor;

        await pool.request()
            .input('MealID', sql.Int, mealId)
            .input('UserID', sql.Int, req.session.user.userId)
            .input('EatenDate', sql.DateTime, new Date())
            .input('Weight', sql.Int, weight)
            .input('Location', sql.VarChar(255), location)
            .input('TotalCalories', sql.Decimal(10, 2), calories)
            .input('TotalProtein', sql.Decimal(10, 2), protein)
            .input('TotalFat', sql.Decimal(10, 2), fat)
            .input('TotalFiber', sql.Decimal(10, 2), fiber)
            .query(`
                INSERT INTO MealsEaten 
                (MealId, UserId, EatenDate, Weight, Location, TotalCalories, TotalProtein, TotalFat, TotalFiber) 
                VALUES (@MealID, @UserID, @EatenDate, @Weight, @Location, @TotalCalories, @TotalProtein, @TotalFat, @TotalFiber)
            `);

        res.json({ success: true, message: 'Meal logged successfully' });
    } catch (err) {
        console.error('Error logging meal:', err);
        res.status(500).send('Error logging meal');
    }
});

//Endpoint til at hente loggede måltider
app.get('/api/logged-meals', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('User not logged in');
    }

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('UserID', sql.Int, req.session.user.userId)
            .query(`
                SELECT M.MealName, E.Weight, E.EatenDate, E.Location, E.MealEatenId,
                       E.TotalCalories, E.TotalProtein, E.TotalFat, E.TotalFiber
                FROM MealsEaten E
                JOIN Meals M ON E.MealId = M.MealId
                WHERE E.UserId = @UserID
                ORDER BY E.EatenDate DESC
            `);

        const meals = result.recordset.map(row => ({
            mealName: row.MealName,
            weight: row.Weight,
            dateTime: row.EatenDate,
            location: row.Location || 'Unknown Location',
            mealEatenId: row.MealEatenId,
            totalCalories: row.TotalCalories,
            totalProtein: row.TotalProtein,
            totalFat: row.TotalFat,
            totalFiber: row.TotalFiber
        }));

        res.json(meals);
    } catch (err) {
        console.error('Error retrieving logged meals:', err);
        res.status(500).send('Server error');
    }
});



//Endpoint til at gemme en ingrediens 
app.post('/api/log-ingredient', async (req, res) => {
    const { FoodID, quantity, nameOfIngredient, kalorierGem } = req.body;

    if (!req.session.user || !req.session.user.userId) {
        return res.status(401).json({ success: false, message: 'No user logged in' });
    }

    const UserID = req.session.user.userId;

    try {
        let pool = await sql.connect(config);
        const result = await pool.request()
            .input('FoodID', sql.Int, FoodID)
            .input('Quantity', sql.Int, quantity)
            .input('UserID', sql.Int, UserID)
            .input('NameOfIngredient', sql.NVarChar, nameOfIngredient)
            .input('LoggedDate', sql.DateTime, new Date())
            .input('TotalCalories', sql.Int, kalorierGem)
            .query('INSERT INTO IngredientsAmount (FoodID, UserID, Quantity, NameOfIngredient, LoggedDate, TotalCalories) OUTPUT INSERTED.IngredientID VALUES (@FoodID, @UserID, @Quantity, @NameOfIngredient, @LoggedDate, @TotalCalories)');

        if (result.recordset.length > 0) {
            const ingredientId = result.recordset[0].IngredientID;
            res.json({ success: true, message: 'Ingredient logged successfully', ingredientId: ingredientId });
        } else {
            throw new Error('Failed to retrieve the ingredient ID');
        }
    } catch (err) {
        console.error('Error logging ingredient:', err);
        res.status(500).json({ success: false, message: 'Error logging ingredient', error: err.toString() });
    }
});

//Endpoint til at hente de gemte ingredienser 
app.get('/api/logged-ingredients', async (req, res) => {
    if (!req.session.user || !req.session.user.userId) {
        return res.status(401).send('User not logged in');
    }

    const UserID = req.session.user.userId;

    try {
        let pool = await sql.connect(config);
        const result = await pool.request()
            .input('UserID', sql.Int, UserID)
            .query('SELECT IngredientID, NameOfIngredient, Quantity, LoggedDate, TotalCalories FROM IngredientsAmount WHERE UserID = @UserID ORDER BY LoggedDate DESC');

        if (result.recordset.length > 0) {
            res.json({ success: true, ingredients: result.recordset });
        } else {
            res.status(404).send('No ingredients found for the user');
        }
    } catch (err) {
        console.error('Database operation failed:', err);
        res.status(500).send('Server error');
    }
});

//Endpoint til at slette de gemte ingredienser
app.delete('/api/delete-ingredient/:ingredientId', async (req, res) => {
    const { ingredientId } = req.params;

    if (!req.session.user || !req.session.user.userId) {
        return res.status(401).send('User not logged in');
    }

    const ingredientIdInt = parseInt(ingredientId, 10);
    if (isNaN(ingredientIdInt)) {
        return res.status(400).send('Invalid Ingredient ID provided');
    }

    try {
        await sql.connect(config);
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('IngredientID', sql.Int, ingredientIdInt)
            .input('UserID', sql.Int, req.session.user.userId)
            .query('DELETE FROM IngredientsAmount WHERE IngredientID = @IngredientID AND UserID = @UserID');

        if (result.rowsAffected[0] > 0) {
            res.status(200).json({ success: true, message: 'Ingredient deleted successfully' });
        } else {
            res.status(404).send('Ingredient not found or user mismatch');
        }
    } catch (err) {
        console.error('Database operation failed:', err);
        res.status(500).send('Failed to delete ingredient');
    }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////// DAILY NUTRI  ///////////////////

//Dagsview
app.get('/user/daily-intake', async (req, res) => {
    if (req.session.user && req.session.user.userId) {
        try {
            let pool = await sql.connect(config);
            const query = `SELECT MealHour, SUM(TotalCalories) AS TotalCalories, SUM(TotalLiquid) AS TotalLiquid, SUM(CaloriesBurned) AS TotalCaloriesBurned
            FROM (
                SELECT DATEPART(hour, EatenDate) AS MealHour, TotalCalories, 0 AS TotalLiquid, 0 AS CaloriesBurned
                FROM MealsEaten
                WHERE UserID = @UserID AND CAST(EatenDate AS date) = CAST(GETDATE() AS date)
                UNION ALL
                SELECT DATEPART(hour, IntakeDateTime) AS MealHour, 0 AS TotalCalories, Amount AS TotalLiquid, 0 AS CaloriesBurned
                FROM WaterIntake
                WHERE UserID = @UserID AND CAST(IntakeDateTime AS date) = CAST(GETDATE() AS date)
                UNION ALL
                SELECT DATEPART(hour, Date) AS MealHour, 0 AS TotalCalories, 0 AS TotalLiquid, CaloriesBurned
                FROM Activities
                WHERE UserID = @UserID AND CAST(Date AS date) = CAST(GETDATE() AS date)
                UNION ALL
                SELECT DATEPART(hour, LoggedDate) AS MealHour, TotalCalories AS TotalCalories, 0 AS TotalLiquid, 0 AS CaloriesBurned
                FROM IngredientsAmount
                WHERE UserID = @UserID AND CAST(LoggedDate AS date) = CAST(GETDATE() AS date)
            ) AS CombinedData
            GROUP BY MealHour
            ORDER BY MealHour
            `;
            const result = await pool.request()
                .input('UserID', sql.Int, req.session.user.userId)
                .query(query);

            res.json({ success: true, data: result.recordset });
        } catch (err) {
            console.error('Failed to retrieve daily intake data:', err);
            res.status(500).json({ success: false, message: 'Failed to retrieve daily intake data', error: err.message });
        }
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
});

/// Månedsview
app.get('/user/monthly-intake', async (req, res) => {
    if (req.session.user && req.session.user.userId) {
        try {
            let pool = await sql.connect(config);
            const query = `
SELECT CAST(EatenDate AS date) AS MealDay, 
       SUM(TotalCalories) AS TotalCalories, 
       SUM(TotalLiquid) AS TotalLiquid, 
       SUM(CaloriesBurned) AS TotalCaloriesBurned
FROM (
    SELECT CAST(EatenDate AS date) AS EatenDate, TotalCalories, 0 AS TotalLiquid, 0 AS CaloriesBurned
    FROM MealsEaten
    WHERE UserID = @UserID AND EatenDate >= DATEADD(day, -30, GETDATE())
    UNION ALL
    SELECT CAST(IntakeDateTime AS date) AS EatenDate, 0 AS TotalCalories, Amount AS TotalLiquid, 0 AS CaloriesBurned
    FROM WaterIntake
    WHERE UserID = @UserID AND IntakeDateTime >= DATEADD(day, -30, GETDATE())
    UNION ALL
    SELECT CAST(Date AS date) AS EatenDate, 0 AS TotalCalories, 0 AS TotalLiquid, CaloriesBurned
    FROM Activities
    WHERE UserID = @UserID AND Date >= DATEADD(day, -30, GETDATE())
    UNION ALL 
    SELECT CAST(LoggedDate AS date) AS EatenDate, TotalCalories AS TotalCalories, 0 AS TotalLiquid, 0 AS CaloriesBurned
    FROM IngredientsAmount
    WHERE UserID = @UserID AND LoggedDate >= DATEADD(day, -30, GETDATE())
) AS CombinedData
GROUP BY CAST(EatenDate AS date)
ORDER BY CAST(EatenDate AS date)
            `;
            const result = await pool.request()
                .input('UserID', sql.Int, req.session.user.userId)
                .query(query);

            res.json({ success: true, data: result.recordset });
        } catch (err) {
            console.error('Error retrieving monthly intake data:', err);
            res.status(500).json({ success: false, message: 'Error retrieving monthly intake data', error: err.message });
        }
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
});

/// Vælg 30 dage eller 24 timer
app.get('/user/intake-data', async (req, res) => {
    const { timeframe } = req.query;
    let query = '';
    if (timeframe === '24hours') {
        query = `SELECT DATEPART(hour, EatenDate) AS MealHour, 
                 SUM(TotalCalories) AS TotalCalories, 
                 SUM(TotalLiquid) AS TotalLiquid, 
                 SUM(CaloriesBurned) AS TotalCaloriesBurned
                 FROM CombinedData
                 WHERE UserID = @UserID AND EatenDate >= DATEADD(hour, -24, GETDATE())
                 GROUP BY DATEPART(hour, EatenDate)
                 ORDER BY MealHour`;
    } else if (timeframe === '30days') {
        query = `SELECT CAST(EatenDate AS date) AS MealDay, 
                 SUM(TotalCalories) AS TotalCalories, 
                 SUM(TotalLiquid) AS TotalLiquid, 
                 SUM(CaloriesBurned) AS TotalCaloriesBurned
                 FROM CombinedData
                 WHERE UserID = @UserID AND EatenDate >= DATEADD(day, -30, GETDATE())
                 GROUP BY CAST(EatenDate AS date)
                 ORDER BY MealDay`;
    }

    if (req.session.user && req.session.user.userId) {
        try {
            let pool = await sql.connect(config);
            const result = await pool.request()
                .input('UserID', sql.Int, req.session.user.userId)
                .query(query);

            res.json({ success: true, data: result.recordset });
        } catch (err) {
            console.error('Error retrieving intake data:', err);
            res.status(500).json({ success: false, message: 'Error retrieving intake data', error: err.message });
        }
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
});

//Indhenter brugerens basalstofskifte
app.get('/user/basalstofskifte', async (req, res) => {
    if (req.session.user && req.session.user.userId) {
        try {
            let pool = await sql.connect(config);
            const query = `SELECT Basalforbrændning FROM Users WHERE UserID = @UserID`;
            const result = await pool.request()
                .input('UserID', sql.Int, req.session.user.userId)
                .query(query);

            res.json({ success: true, data: result.recordset });
        } catch (err) {
            console.error('Failed to retrieve Basalstofskifte data:', err);
            res.status(500).json({ success: false, message: 'Failed to retrieve Basalstofskifte data', error: err.message });
        }
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized' });
    }
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;