const pool = require('../../../config/db');

const getDataDashboard = async (req, res) => {
    try {
        const [mente] = await pool.query(`
                SELECT COUNT(*) AS totalMentee
                FROM
                    users u
                WHERE
                    u.role = 'USER';
            `);

        const [mentor] = await pool.query(`
                SELECT COUNT(*) AS totalMentor
                FROM
                    users u
                WHERE
                    u.role = 'MENTOR';
            `);

        const [course] = await pool.query(`
                SELECT COUNT(*) AS totalCourse
                FROM
                    course;
            `);
        const [event] = await pool.query(`
                SELECT COUNT(*) AS totalEvent
                FROM
                    event;
            `);
        const [challenge] = await pool.query(`
                SELECT COUNT(*) AS totalChallenge
                FROM
                    challenge
            `);

        const data = {
            totalMentee : mente[0].totalMentee,
            totalMentor : mentor[0].totalMentor,
            totalCourse : course[0].totalCourse,
            totalEvent : event[0].totalEvent,
            totalChallenge: challenge[0].totalChallenge
        }

        res.json(data);
    } catch (error) {
        res.status(500).json({ error : error.message });
    }
};

module.exports = {
    getDataDashboard
};