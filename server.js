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
        if (passwordMatch) {
            req.session.user = username;  // Storing username in session
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
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'No user logged in' });
    }

    const { weight, age, sex } = req.body;
    const username = req.session.user;

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
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'No user logged in' });
    }

    const username = req.session.user;

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
    if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'No user logged in' });
    }

    try {
        let pool = await sql.connect(config);
        const username = req.session.user;

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// muliggør det at brugeren laver et måltid ud fra ingredienser i databasen (route)

// Create a new meal
app.post('/create-meal', async (req, res) => {
    const { mealName, ingredients } = req.body;

    // Check if the user is logged in
    if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'No user logged in' });
    }

    // Validate the meal name and ingredients
    if (!mealName) {
        return res.status(400).json({ success: false, message: 'Meal name is required' });
    }
    if (!Array.isArray(ingredients) || ingredients.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one ingredient is required' });
    }

    // Start a database transaction
    let pool = await sql.connect(config);
    const transaction = new sql.Transaction(pool);
    try {
        await transaction.begin();

        // Insert the meal into the Meals table and get the meal ID
        const mealInsert = await transaction.request()
            .input('MealName', sql.NVarChar, mealName)
            .input('Username', sql.VarChar, req.session.user)
            .query('INSERT INTO Meals (MealName, UserID) OUTPUT INSERTED.MealID VALUES (@MealName, (SELECT UserID FROM Users WHERE Username = @Username))');

        const mealID = mealInsert.recordset[0].MealID;

        // Insert each ingredient into the MealIngredients table
        for (const ingredient of ingredients) {
            await transaction.request()
                .input('MealID', sql.Int, mealID)
                .input('FoodID', sql.Int, ingredient.foodID)
                .input('Quantity', sql.Decimal, ingredient.quantity)
                .query('INSERT INTO MealIngredients (MealID, FoodID, Quantity) VALUES (@MealID, @FoodID, @Quantity)');
        }

        await transaction.commit();
        res.json({ success: true, message: 'Meal created successfully' });
    } catch (err) {
        // If there's an error, roll back the transaction
        if (transaction) await transaction.rollback();
        console.error('Error creating meal:', err);
        res.status(500).json({ success: false, message: 'Meal creation failed', error: err.message });
    }
});

// Fetch Food ID from the Database

app.get('/api/FoodItems/BySearch/:ingredient', async (req, res) => {
    const { ingredient } = req.params;
    try {
        let pool = await sql.connect(config);
        const result = await pool.request()
            .input('Ingredient', sql.NVarChar, `%${ingredient}%`)
            .query('SELECT FoodID, FoodName FROM Food WHERE FoodName LIKE @Ingredient');

        if (result.recordset.length > 0) {
            res.json(result.recordset);
        } else {
            res.status(404).send('Ingredient not found');
        }
    } catch (err) {
        console.error('Database query failed:', err);
        res.status(500).send('Database query error');
    }
});

// Fetch Nutritional Values Based on Food ID

app.get('/api/FoodCompSpecs/ByItem/:foodID/BySortKey/:sortKey', async (req, res) => {
    const { foodID, sortKey } = req.params;
    try {
        let pool = await sql.connect(config);
        const query = 'SELECT NutritionValue FROM NutritionalData WHERE FoodID = @FoodID AND SortKey = @SortKey';
        const result = await pool.request()
            .input('FoodID', sql.Int, foodID)
            .input('SortKey', sql.Int, sortKey)
            .query(query);

        if (result.recordset.length > 0) {
            res.json(result.recordset);
        } else {
            res.status(404).send('Nutritional information not found');
        }
    } catch (err) {
        console.error('Database query failed:', err);
        res.status(500).send('Database query error');
    }
});


// Get Meals for a specific user

app.post('/create-meal', async (req, res) => {
    const { mealName, ingredients } = req.body;

    if (!req.session || !req.session.user) {
        return res.status(401).json({ success: false, message: 'No user logged in' });
    }

    try {
        let pool = await sql.connect(config);
        const transaction = new sql.Transaction(pool);
        await transaction.begin();
        
        const mealInsert = await transaction.request()
            .input('MealName', sql.NVarChar, mealName)
            .input('Username', sql.VarChar, req.session.user)
            .query('INSERT INTO Meals (MealName, UserID) OUTPUT INSERTED.MealID VALUES (@MealName, (SELECT UserID FROM Users WHERE Username = @Username))');

        const mealID = mealInsert.recordset[0].MealID;

        for (const ingredient of ingredients) {
            await transaction.request()
                .input('MealID', sql.Int, mealID)
                .input('FoodID', sql.Int, ingredient.foodID)
                .input('Quantity', sql.Decimal, ingredient.quantity)
                .query('INSERT INTO MealIngredients (MealID, FoodID, Quantity) VALUES (@MealID, @FoodID, @Quantity)');
        }

        await transaction.commit();
        res.json({ success: true, message: 'Meal created successfully' });
    } catch (err) {
        await transaction.rollback();
        console.error('Error creating meal:', err);
        res.status(500).json({ success: false, message: 'Meal creation failed', error: err.message });
    }
});
