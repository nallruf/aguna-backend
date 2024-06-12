const pool = require('../../../config/db');

const getRole = async (req, res) => {
    try {
        const [roles] = await pool.query(`
                SELECT
                r.id AS role_id,
                r.name AS role_name,
                COUNT(DISTINCT p.id) AS total_path,
                COUNT(DISTINCT pf.id) AS total_path_focus,  
                COUNT(DISCTINCT c.id) AS total_course,
                COUNT(DISTINCT uc.id) AS total_student
                FROM
                    role r
                LEFT JOIN
                    path p ON r.id = p.roleId
                LEFT JOIN
                    pathFocus pf ON p.id = pf.pathId
                LEFT JOIN
                    course c ON pf.id = c.pathFocusId
                LEFT JOIN
                    userCourse uc ON c.id = uc.courseId
                GROUP BY
                    r.id;
            `);
            res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createRole = async (req, res) => {
    const { name } = req.body;
    try {
        const [roles] = await pool.query('INSERT INTO role (name) VALUES (?)', [name]);
        res.json({ message: 'Role has been added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDetailRole = async (req, res) => {
    const { roleId } = req.params;
    try {
        const [role] = await pool.query(`
            SELECT
                r.id AS role_id,
                r.name AS role_name,
                COUNT(DISTINCT p.id) AS total_path,
                COUNT(DISTINCT pf.id) AS total_path_focus,
                COUNT(DISTINCT c.id) AS total_course
                COUNT(DISTINCT t.id) AS total_test
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', p.id,
                        'name', p.name,
                        'imageurl', p.image,
                        'description', p.description,
                    ) 
                ) AS paths
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', t.id,
                        'name', t.name,
                        'description', t.description,
                        'duration', t.duration,
                    )
                ) AS test
                FROM
                    role r
                LEFT JOIN
                    path p ON r.id = p.roleId
                LEFT JOIN
                    pathFocus pf ON p.id = pf.pathId
                LEFT JOIN
                    course c ON pf.id = c.pathFocusId
                LEFT JOIN
                    test t ON r.testId =  t.id
                WHERE
                    r.id = ?
        `, [roleId]);

        if (role.length === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }

        res.json(role);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateRole = async (req, res) => {
    const { roleId } = req.params;
    const { name } = req.body;
    try {
        const [roles] = await pool.query('UPDATE role SET name = ? WHERE id = ?', [name, roleId]);
        res.json({ message: 'Role has been updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPath = async (req, res ) => {
   

};

module.exports = {
    getRole,
    createRole 
}


