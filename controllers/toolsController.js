const pool = require('../config/db');

const createTools = async (req, res) => {
    const { name, description } = req.body;
    const image = req.file ? req.file.filename : null;

    console.log(name, description, image)
    console.log(req.file);
    
    try {
        const [result] = await pool.query(
            'INSERT INTO tools (name, description, image) VALUES (?, ?, ?)',
            [name, description, image]
        );
        res.status(201).json({ message: 'Tool created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = { createTools };