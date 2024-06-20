const pool = require('../../../config/db');

const getSkill = async (req, res) => {
    try {
        const [skill] = await pool.query(`
            SELECT 
                s.id AS id,
                s.name AS name
            FROM
                skills s
            GROUP BY s.id
        `);

        res.json(skill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createSkill = async (req, res) => {
    const { name } = req.body;

    try {
        const [skill] = await pool.query('INSERT INTO skills (name) VALUES (?)', [name]);

        if (skill.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to create skill' });
        }
        
        res.json({ message: 'Skill created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getSkillById = async (req, res) => { 
    const { skillId } = req.params;

    try {
        const [skill] = await pool.query(`
            SELECT 
                s.id AS id,
                s.name AS name
            FROM
                skills s
            WHERE s.id = ?
            GROUP BY s.id
        `, [skillId]);

        res.json(skill);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateSkill = async (req, res) => {
    const { skillId } = req.params;
    const { name } = req.body;

    try {
        const [ skill] = await pool.query('UPDATE skills SET name = ? WHERE id = ?', [name, skillId]);

        if (skill.affectedRows === 0) {
            return res.status(400).json({ error: 'update failed' });
        }

        res.json({ message: 'Skill updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteSkill = async (req, res) => {
    const { skillId } = req.params;

    try {
        const [challengeSkills] = await pool.query('DELETE FROM challengeSkills WHERE skillId = ?', [skillId]);
        const [userSkills] = await pool.query('DELETE FROM userSkills WHERE skillId = ?', [skillId]);
        const [courseSkills] = await pool.query('DELETE FROM courseSkills WHERE skillId = ?', [skillId]);
        const [eventSkills] = await pool.query('DELETE FROM eventSkills WHERE skillId = ?', [skillId]);
        const [testSkills] = await pool.query('DELETE FROM testSkills WHERE skillId = ?', [skillId]);

        const [skill] = await pool.query('DELETE FROM skills WHERE id = ?', [skillId]);

        if (skill.affectedRows === 0) {
            return res.status(400).json({ error: 'Delete skill failed' });
        }

        res.json({ message: 'Skill deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getSkill,
    createSkill,
    getSkillById,
    updateSkill,
    deleteSkill
}