
import express from 'express';
import Database from './database.js';
import { config } from './config.js';

const router = express.Router();
const database = new Database(config);

//Post endpoint til at oprette bruger??
router.post('/opretBruger', async (req, res) => {
    try {
        const result = await database.createUser(req.body);
        if (result.rowsAffected > 0) {
            res.status(201).json({ success: true, message: 'Bruger oprettet succesfuldt.' });
        } else {
            res.status(400).json({ success: false, message: 'Ingen bruger blev oprettet.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Server fejl: ' + err.message });
    }
});

export default router;
