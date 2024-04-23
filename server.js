const express = require('express');
const sql = require('mssql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');
const cors = require('cors');


const app = express();

app.use(cors());
app.use(express.json());

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
    console.log("hej")
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
