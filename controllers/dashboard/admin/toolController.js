const pool = require('../../../config/db');
const fs = require('fs-extra');
const path = require('path');

const getTool = async (req, res) => {
    try {
        const [tool] = await pool.query(`
            SELECT 
                t.id AS id,
                t.name AS name,
                t.description AS description,
                t.imageUrl AS imageUrl
            FROM
                tools t
            GROUP BY t.id
        `);

        res.json(tool);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createTool = async (req, res) => {
    const { name, description } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        await pool.query('INSERT INTO tools (name, description ,imageUrl) VALUES (?, ?, ?)', [name, description, image]);

        res.json({ message: 'Tool created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getToolById = async (req, res) => {
    const { toolId } = req.params;

    try {
        const [tool] = await pool.query(`
            SELECT 
                t.id AS id,
                t.name AS name,
                t.description AS description,
                t.imageUrl AS imageUrl
            FROM
                tools t
            WHERE t.id = ?
            GROUP BY t.id
        `, [toolId]);

        res.json(tool);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateTool = async (req, res) => {
    const { toolId } = req.params;
    let { name, description } = req.body;
    let image = req.file ? req.file.filename : null;

    try {
        const [tool] = await pool.query('SELECT * FROM tools WHERE id = ?', [toolId]);

        if (tool.length === 0) {
            return res.status(400).json({ error: 'Tool not found' });
        }

        if (image === null) {
            image = tool[0].imageUrl;
        }

        if (name === '') {
            name = tool[0].name;
        }

        if (description === '') {
            description = tool[0].description;
        }



         const [updateTool] = await pool.query('UPDATE tools SET name = ?, description = ?, imageUrl = ? WHERE id = ?', [name, description, image, toolId]);

         if (updateTool.affectedRows === 0) {
             return res.status(400).json({ error: 'Tool not found' });
         }

         if (tool[0].imageUrl !== null && image !== tool[0].imageUrl) {

            await fs.unlink(path.join(`public/images/${tool[0].imageUrl}`))

         }

         
        res.json({ message: 'Tool updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteTool = async (req, res) => {
    const { toolId } = req.params;

    try {
        const [tool] = await pool.query('SELECT * FROM tools WHERE id = ?', [toolId]);

        if (tool.length === 0) {
            return res.status(400).json({ error: 'Tool not found' });
        }


        await pool.query('DELETE FROM courseTools WHERE toolId = ?', [toolId])
        await pool.query('DELETE FROM tools WHERE id = ?', [toolId]);

        if (tool[0].imageUrl !== null) {
            await fs.unlink(path.join(`public/images/${tool[0].imageUrl}`))
        }

        res.json({ message: 'Tool deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getTool,
    createTool,
    getToolById,
    updateTool,
    deleteTool
}