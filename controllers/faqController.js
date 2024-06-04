const pool = require('../config/db');

const getFaq = async (req, res) => {
    try {
        const [data] = await pool.query('SELECT * FROM faq');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getFaq
};