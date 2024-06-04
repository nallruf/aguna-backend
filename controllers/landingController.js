const pool = require('../config/db');

const getDataLanding = async (req, res) => {
    try {
        const [roles] = await pool.query(`
            SELECT
            r.id AS role_id,
            r.name AS role_name,
            COUNT(DISTINCT p.id) AS total_path,
            COUNT(DISTINCT c.id) AS total_course,
            COUNT(DISTINCT uc.id) AS total_student,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                    'id', p.id,
                    'name', p.name,
                    'imageurl', p.image,
                    'description', p.description,
                    'totalStudent', COALESCE(ts.total_student, 0)
                )
            ) AS paths
            FROM
                role r
            LEFT JOIN
                path p ON r.id = p.roleId
            LEFT JOIN
                (
                    SELECT
                        p.id AS path_id,
                        COUNT(DISTINCT c.id) AS total_course,
                        COUNT(DISTINCT uc.id) AS total_student
                    FROM
                        path p
                    LEFT JOIN
                        pathFocus pf ON p.id = pf.pathId
                    LEFT JOIN
                        course c ON pf.id = c.pathFocusId
                    LEFT JOIN
                        userCourse uc ON c.id = uc.courseId
                    GROUP BY
                        p.id
                ) ts ON p.id = ts.path_id
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
    }catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getFaq = async (req, res) => {
    try {
        const [data] = await pool.query('SELECT * FROM faq');
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    getDataLanding,
    getFaq
}