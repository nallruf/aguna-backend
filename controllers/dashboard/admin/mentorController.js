const pool = require('../../../config/db');

const getMentor = async (req, res) => {
    try {
        const [mentors] = await pool.query(`
            SELECT
                m.id AS id,
                u.name AS name,
                u.imageUrl AS imageUrl,
                u.email AS email,
                m.job AS job,
                (
                    SELECT COUNT(*)
                    FROM
                        userCourse uc
                    WHERE
                        uc.courseId IN (
                            SELECT id
                            FROM course
                            WHERE mentorId = m.id
                    )
                ) AS totalStudent
            FROM
                mentor m
            LEFT JOIN
                users u ON m.userId = u.id
            GROUP BY m.id
        `);

        res.json(mentors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const searchMentorByName = async (req, res) => {
    const { name } = req.query;

    try {
    const [mentors] = await pool.query(`
        SELECT
            m.id AS id,
            u.name AS name,
            u.imageUrl AS imageUrl,
            u.email AS email,
            m.job AS job,
            (
                SELECT COUNT(*)
                FROM
                    userCourse uc
                WHERE
                    uc.courseId IN (
                        SELECT id
                        FROM course
                        WHERE mentorId = m.id
                )
            ) AS totalStudent
        FROM
            mentor m
        LEFT JOIN
            users u ON m.userId = u.id
        WHERE u.name LIKE ?
        GROUP BY m.id
    `, [`%${name}%`]);

    res.json(mentors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getMentor,
    searchMentorByName
}