const pool = require('../../../config/db');

const getDataDashboard = async (req, res) => {
    const userId = req.user.userId;
    
    try {
        const [course] = await pool.query(`
                SELECT COUNT(*) AS totalCourse
                FROM
                    userCourse uc
                WHERE
                    uc.userId = ?;
            `, [userId]);

        const [event] = await pool.query(`
                SELECT COUNT(*) AS totalEvent
                FROM
                    transaction t
                WHERE
                    t.type = 'EVENT' AND t.userId= ?    
            `, [userId]);

        const [challenge] = await pool.query(`
                SELECT COUNT(*) AS totalChallenge
                FROM
                    submission s
                WHERE
                    s.userId = ?
                `, [userId])
        
        const data = {
            totalCourse : course[0].totalCourse,
            totalEvent : event[0].totalEvent,
            totalChallenge : challenge[0].totalChallenge,
        }
        res.json(data);
    } catch (error) {
        res.status(500).json({ error : error.message });
    }
    
};

const getDataMentoring = async (req, res) => {
        
};

const getLatestCourse = async (req, res) => {
    const userId = req.user.userId;

    
};


module.exports = {
    getDataDashboard
};
