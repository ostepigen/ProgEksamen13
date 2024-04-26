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
    getFoodCompSpecs(ingredients)
});

async function getFoodCompSpecs(ingredients) {
    let pool = await sql.connect(config);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    let foodCompSpecs = [];
    let sortKeys = [1030, 1110, 1310, 1240]; // Energy, Protein, Fat, Fiber

    for (const ingredient of ingredients) {
        let nutrientValues = {};
        for (const sortKey of sortKeys) {
            const result = await transaction.request()
                .input('FoodID', sql.Int, ingredient.foodID)
                .input('SortKey', sql.Int, sortKey)
                .query('SELECT ResVal FROM DataFood WHERE FoodID = @FoodID AND SortKey = @SortKey');
            if (result.recordset.length > 0) {
                nutrientValues[sortKey] = result.recordset[0].ResVal;
            } else {
                // Handle the case where no result is found
                nutrientValues[sortKey] = null;
            }
        }
        foodCompSpecs.push({
            foodID: ingredient.foodID,
            nutrients: nutrientValues
        });
    }
    await transaction.commit();
    return foodCompSpecs;
}

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


app.get("/submit", async (req, res) => {
    let ingredient = req.query.ingredient;  // Changed to use query parameter
    try {
        let pool = await sql.connect(config);
        const ingredientQuery = await pool.request()
            .input('IngredientName', sql.NVarChar, `%${ingredient}%`)
            .query('SELECT * FROM DataFood WHERE FoodName LIKE @IngredientName');
        
        // Map the database result to the desired format if necessary
        const results = ingredientQuery.recordset.map(record => ({
            macroName: 'Fiber',  // Example, you would map all needed fields similarly
            value: record.Fiber   // Assuming 'Fiber' is a column in your DataFood table
        }));

        res.json(results);
    } catch (err) {
        console.error('Database query failed:', err);
        res.status(500).send('Database query error');
    }
});





// Fetch Food ID from the Database – det er den nuværende funktion der gør det muligt at søge efter ingredienser

// app.get('/api/FoodItems/BySearch/:ingredient', async (req, res) => {
//     const { ingredient } = req.params;
//     try {
//         let pool = await sql.connect(config);
//         const result = await pool.request()
//             .input('Ingredient', sql.NVarChar, `%${ingredient}%`)
//             .query('SELECT FoodID, FoodName FROM Food WHERE FoodName LIKE @Ingredient');

//         if (result.recordset.length > 0) {
//             res.json(result.recordset);
//         } else {
//             res.status(404).send('Ingredient not found');
//         }
//     } catch (err) {
//         console.error('Database query failed:', err);
//         res.status(500).send('Database query error');
//     }
// });

// Fetch Nutritional Values Based on Food ID

// app.get('/api/FoodCompSpecs/ByItem/:foodID/BySortKey/:sortKey', async (req, res) => {
//     const { foodID, sortKey } = req.params;
//     try {
//         let pool = await sql.connect(config);
//         const query = 'SELECT NutritionValue FROM NutritionalData WHERE FoodID = @FoodID AND SortKey = @SortKey';
//         const result = await pool.request()
//             .input('FoodID', sql.Int, foodID)
//             .input('SortKey', sql.Int, sortKey)
//             .query(query);

//         if (result.recordset.length > 0) {
//             res.json(result.recordset);
//         } else {
//             res.status(404).send('Nutritional information not found');
//         }
//     } catch (err) {
//         console.error('Database query failed:', err);
//         res.status(500).send('Database query error');
//     }
// });

// // Add this endpoint in server.js

// app.get('/api/get-food-nutrition/:ingredientName', async (req, res) => {
//     const { ingredientName } = req.params;

//     try {
//         let pool = await sql.connect(config);
//         const foodResult = await pool.request()
//             .input('IngredientName', sql.NVarChar, `%${ingredientName}%`)
//             .query('SELECT TOP 1 FoodID FROM Food WHERE FoodName LIKE @IngredientName');

//         if (foodResult.recordset.length === 0) {
//             return res.status(404).json({ success: false, message: 'Ingredient not found' });
//         }

//         const foodID = foodResult.recordset[0].FoodID;
//         const nutritionResult = await pool.request()
//             .input('FoodID', sql.Int, foodID)
//             .query('SELECT Energi, Protein, Fat, Fiber FROM DataFood WHERE FoodID = @FoodID');

//         if (nutritionResult.recordset.length > 0) {
//             const nutritionData = nutritionResult.recordset[0];
//             res.json({ success: true, data: { foodID, ...nutritionData } });
//         } else {
//             res.status(404).json({ success: false, message: 'Nutritional data not found' });
//         }
//     } catch (err) {
//         console.error('Database operation failed:', err);
//         res.status(500).json({ success: false, message: 'Server error', error: err.message });
//     }
// });


// Get Meals for a specific user

// app.post('/create-meal', async (req, res) => {
//     const { mealName, ingredients } = req.body;

//     if (!req.session || !req.session.user) {
//         return res.status(401).json({ success: false, message: 'No user logged in' });
//     }

//     try {
//         let pool = await sql.connect(config);
//         const transaction = new sql.Transaction(pool);
//         await transaction.begin();
        
//         const mealInsert = await transaction.request()
//             .input('MealName', sql.NVarChar, mealName)
//             .input('Username', sql.VarChar, req.session.user)
//             .query('INSERT INTO Meals (MealName, UserID) OUTPUT INSERTED.MealID VALUES (@MealName, (SELECT UserID FROM Users WHERE Username = @Username))');

//         const mealID = mealInsert.recordset[0].MealID;

//         for (const ingredient of ingredients) {
//             await transaction.request()
//                 .input('MealID', sql.Int, mealID)
//                 .input('FoodID', sql.Int, ingredient.foodID)
//                 .input('Quantity', sql.Decimal, ingredient.quantity)
//                 .query('INSERT INTO MealIngredients (MealID, FoodID, Quantity) VALUES (@MealID, @FoodID, @Quantity)');
//         }

//         await transaction.commit();
//         res.json({ success: true, message: 'Meal created successfully' });
//     } catch (err) {
//         await transaction.rollback();
//         console.error('Error creating meal:', err);
//         res.status(500).json({ success: false, message: 'Meal creation failed', error: err.message });
//     }
// });

// app.post('/create-meal', async (req, res) => {
//     const { mealName, ingredients, totalCalories, totalProtein, totalFat, totalFiber } = req.body;

//     if (!req.session || !req.session.user) {
//         return res.status(401).json({ success: false, message: 'No user logged in' });
//     }

//     if (!mealName || ingredients.length === 0) {
//         return res.status(400).json({ success: false, message: 'Meal name and ingredients are required' });
//     }

//     let pool = await sql.connect(config);
//     const transaction = new sql.Transaction(pool);

//     try {
//         await transaction.begin();

//         const mealInsert = await transaction.request()
//             .input('MealName', sql.NVarChar, mealName)
//             .input('Username', sql.VarChar, req.session.user)
//             .input('TotalCalories', sql.Float, totalCalories)
//             .input('TotalProtein', sql.Float, totalProtein)
//             .input('TotalFat', sql.Float, totalFat)
//             .input('TotalFiber', sql.Float, totalFiber)
//             .query('INSERT INTO Meals (MealName, UserID, TotalCalories, TotalProtein, TotalFat, TotalFiber) OUTPUT INSERTED.MealID VALUES (@MealName, (SELECT UserID FROM Users WHERE Username = @Username), @TotalCalories, @TotalProtein, @TotalFat, @TotalFiber)');

//         const mealID = mealInsert.recordset[0].MealID;

//         for (const ingredient of ingredients) {
//             await transaction.request()
//                 .input('MealID', sql.Int, mealID)
//                 .input('FoodID', sql.Int, ingredient.FoodID)
//                 .input('Quantity', sql.Decimal, ingredient.Quantity)
//                 .query('INSERT INTO MealIngredients (MealID, FoodID, Quantity) VALUES (@MealID, @FoodID, @Quantity)');
//         }

//         await transaction.commit();
//         res.json({ success: true, message: 'Meal created successfully' });
//     } catch (err) {
//         if (transaction) await transaction.rollback();
//         console.error('Error creating meal:', err);
//         res.status(500).json({ success: false, message: 'Meal creation failed', error: err.message });
//     }
// });


// app.get('/get-all', async (req, res) => {
//     /*const userCheck = await sql.request()
//     .query('SELECT * FROM DataFood');
//     res.send(userCheck.recordset);*/


//     res.send("Hello World!")
// });

// app.get('/ingredienser', async (req, res) => {
    
//     //findes i toppen!
//     const { ingredient } = req.params;

//     let pool = await sql.connect(config);
//     const transaction = new sql.Transaction(pool);

//     await transaction.begin();

//     const result = await transaction.request()
//     .input('SELECT *  FROM DataFood WHERE FoodID = 17')


//     res.send(result)
// });

// // Add this function inside server.js

// async function calculateMealNutrition(ingredients) {
//     let totals = { energy: 0, protein: 0, fat: 0, fiber: 0 };
//     let pool = await sql.connect(config);
//     const transaction = new sql.Transaction(pool);

//     try {
//         await transaction.begin();

//         for (const ingredient of ingredients) {
//             const result = await transaction.request()
//                 .input('FoodID', sql.Int, ingredient.foodID)
//                 .query('SELECT Energy, Protein, Fat, Fiber FROM DataFood WHERE FoodID = @FoodID');

//             if (result.recordset.length > 0) {
//                 const nutrient = result.recordset[0];
//                 totals.energy += nutrient.Energy * ingredient.quantity / 100;
//                 totals.protein += nutrient.Protein * ingredient.quantity / 100;
//                 totals.fat += nutrient.Fat * ingredient.quantity / 100;
//                 totals.fiber += nutrient.Fiber * ingredient.quantity / 100;
//             }
//         }

//         await transaction.commit();
//         console.log('Nutritional totals:', totals); // Log the calculated totals
//         return totals;
//     } catch (err) {
//         console.error('Error calculating meal nutrition:', err);
//         if (transaction) await transaction.rollback();
//         throw err; // Rethrow the error to handle it in the calling function
//     }
// }


// // Inside the '/create-meal' endpoint, after ingredients are validated and before they are inserted:
// // Then include nutritionTotals in the insert statement for the Meals table

// app.post('/create-meal', async (req, res) => {
//     const { mealName, ingredients } = req.body;

//     if (!req.session || !req.session.user) {
//         return res.status(401).json({ success: false, message: 'No user logged in' });
//     }

//     if (!mealName || ingredients.length === 0) {
//         return res.status(400).json({ success: false, message: 'Meal name and ingredients are required' });
//     }

//     let pool = await sql.connect(config);
//     const transaction = new sql.Transaction(pool);

//     try {
//         await transaction.begin();
        
//         const nutritionTotals = await calculateMealNutrition(ingredients);

//         // Insert the meal into the Meals table
//         const mealInsert = await transaction.request()
//             .input('MealName', sql.NVarChar, mealName)
//             .input('UserID', sql.Int, req.session.userID) // assuming userID is stored in session
//             .input('TotalCalories', sql.Float, nutritionTotals.energy)
//             .input('TotalProtein', sql.Float, nutritionTotals.protein)
//             .input('TotalFat', sql.Float, nutritionTotals.fat)
//             .input('TotalFiber', sql.Float, nutritionTotals.fiber)
//             .query('INSERT INTO Meals (MealName, UserID, TotalCalories, TotalProtein, TotalFat, TotalFiber) OUTPUT INSERTED.MealID VALUES (@MealName, @UserID, @TotalCalories, @TotalProtein, @TotalFat, @TotalFiber)');

//         const mealID = mealInsert.recordset[0].MealID;

//         // Insert each ingredient into the MealIngredients table
//         for (const ingredient of ingredients) {
//             await transaction.request()
//                 .input('MealID', sql.Int, mealID)
//                 .input('FoodID', sql.Int, ingredient.foodID)
//                 .input('Quantity', sql.Decimal, ingredient.quantity)
//                 .query('INSERT INTO MealIngredients (MealID, FoodID, Quantity) VALUES (@MealID, @FoodID, @Quantity)');
//         }

//         await transaction.commit();
//         res.json({ success: true, message: 'Meal created successfully', mealID: mealID });
//     } catch (err) {
//         if (transaction) await transaction.rollback();
//         console.error('Error creating meal:', err);
//         res.status(500).json({ success: false, message: 'Meal creation failed', error: err.message });
//     }
// });

// app.post('/create-meal', async (req, res) => {
//     const { mealName, ingredients } = req.body;

//     if (!req.session || !req.session.user) {
//         return res.status(401).json({ success: false, message: 'No user logged in' });
//     }

//     if (!mealName || ingredients.length === 0) {
//         return res.status(400).json({ success: false, message: 'Meal name and ingredients are required' });
//     }

//     let pool = await sql.connect(config);
//     const transaction = new sql.Transaction(pool);

//     try {
//         await transaction.begin();
        
//         let totalCalories = 0, totalProtein = 0, totalFat = 0, totalFiber = 0;

//         // Calculate the total macros for the meal
//         for (const ingredient of ingredients) {
//             const nutrientResults = await transaction.request()
//                 .input('FoodID', sql.Int, ingredient.foodID)
//                 .query('SELECT Energy, Protein, Fat, Fiber FROM DataFood WHERE FoodID = @FoodID');

//             if (nutrientResults.recordset.length > 0) {
//                 const nutrient = nutrientResults.recordset[0];
//                 totalCalories += nutrient.Energy * ingredient.quantity / 100;
//                 totalProtein += nutrient.Protein * ingredient.quantity / 100;
//                 totalFat += nutrient.Fat * ingredient.quantity / 100;
//                 totalFiber += nutrient.Fiber * ingredient.quantity / 100;
//             }
//         }

//         // Insert the meal into the Meals table
//         const mealInsert = await transaction.request()
//             .input('MealName', sql.NVarChar, mealName)
//             .input('UserID', sql.Int, req.session.userID) // assuming userID is stored in session
//             .input('TotalCalories', sql.Float, totalCalories)
//             .input('TotalProtein', sql.Float, totalProtein)
//             .input('TotalFat', sql.Float, totalFat)
//             .input('TotalFiber', sql.Float, totalFiber)
//             .query('INSERT INTO Meals (MealName, UserID, TotalCalories, TotalProtein, TotalFat, TotalFiber) OUTPUT INSERTED.MealID VALUES (@MealName, @UserID, @TotalCalories, @TotalProtein, @TotalFat, @TotalFiber)');

//         const mealID = mealInsert.recordset[0].MealID;

//         // Insert each ingredient into the MealIngredients table
//         for (const ingredient of ingredients) {
//             await transaction.request()
//                 .input('MealID', sql.Int, mealID)
//                 .input('FoodID', sql.Int, ingredient.foodID)
//                 .input('Quantity', sql.Decimal, ingredient.quantity)
//                 .query('INSERT INTO MealIngredients (MealID, FoodID, Quantity) VALUES (@MealID, @FoodID, @Quantity)');
//         }

//         await transaction.commit();
//         res.json({ success: true, message: 'Meal created successfully' });
//     } catch (err) {
//         if (transaction) await transaction.rollback();
//         console.error('Error creating meal:', err);
//         res.status(500).json({ success: false, message: 'Meal creation failed', error: err.message });
//     }
// });