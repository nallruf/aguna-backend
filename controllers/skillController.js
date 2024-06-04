const pool = require('../config/db');
require('dotenv').config();

const getSkills = async (req, res) => {
    try {
        const [skills] = await pool.query('SELECT * FROM skills');
        res.json(skills);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getSkills
}