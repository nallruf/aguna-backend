const pool = require('../../../config/db');

const getStatistic = async (req, res) => {
    const userId = req.user.userId;

    try {

        const [challenge] = await pool.query(`
            SELECT COUNT(*) AS totalChallenge
            FROM
                submission s
            WHERE
                s.userId = ?
            `, [userId])
            
        const [point] = await pool.query(`
            SELECT 
                u.point AS point
            FROM    
                users u
            WHERE
                u.id = ?
            `, [userId])

        const data = {
            totalChallenge : challenge[0].totalChallenge,
            point : point[0].point
        }

        res.json(data)
    } catch (error) {
        res.status(500).json({ error : error.message });
    }
}

const getHistory = async (req, res) => {
    const userId = req.user.userId;

    try {
        const [challenges] = await pool.query(`
            SELECT
                s.id AS submissionId,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'challengeId', c.id,
                        'challengeName', c.title,
                        'imageUrl', c.imageUrl
                    )
                ) AS challenge,

                s.score AS point,
                s.isWinner AS winner
            FROM
                submission s
            LEFT JOIN
                challenge c ON s.challengeId = c.id
            WHERE
                s.userId = ?
            GROUP BY
                s.id;
            `, [userId])

        res.json(challenges)
    } catch (error) {
        res.status(500).json({ error : error.message });
    }
}

module.exports = {
    getStatistic,
    getHistory
}