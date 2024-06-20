const pool = require('../config/db');

const getChallenges = async (req, res) => {
    try {
        const [challenges] = await pool.query(`
        SELECT
            c.id AS id,
            c.title AS name,
            c.shortDescription AS shortDescription,
            c.detailDescription AS detailDescription,
            c.imageUrl AS imageUrl,
            c.start AS startDate,
            c.end AS endDate,
            c.totalWinner AS totalWinner,
            JSON_ARRAYAGG(
                JSON_OBJECT('id', s.id, 'name', s.name)
            ) AS skills
        FROM
            challenge c
        JOIN challengeSkills cs ON c.id = cs.challengeId
        JOIN skills s ON cs.skillId = s.id
        GROUP BY
            c.id;
        `);
        res.json(challenges);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getChallengeById = async (req, res) => {
    const { id } = req.params;
    try {
        const [challenges] = await pool.query(`
            SELECT
                c.id AS id,
                c.title AS name,
                c.shortDescription AS shortDescription,
                c.detailDescription AS detailDescription,
                c.imageUrl AS imageUrl,
                c.start AS startDate,
                c.end AS endDate,
                c.totalWinner AS totalWinner,
                JSON_ARRAYAGG(
                    JSON_OBJECT('id', s.id, 'name', s.name)
                ) AS skills
            FROM
                challenge c
            JOIN challengeSkills cs ON c.id = cs.challengeId
            JOIN skills s ON cs.skillId = s.id
            WHERE c.id = ?
            GROUP BY c.id;
        `, [id]);

        if (challenges.length === 0) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        res.json(challenges[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const submitChallenge = async (req, res) => {
    const {id} = req.params;
    const {link} = req.body;
    const userId = req.user.userId

    try {
        const isSubmitted = await pool.query('SELECT * FROM submission WHERE userId = ? AND challengeId = ?', [userId, id]);

        if (isSubmitted[0].length > 0) {
            return res.status(400).json({ message: 'Challenge already submitted' });
        }

        const [submit] = await pool.query('INSERT INTO submission (userId, challengeId, link) VALUES (?, ?, ?)', [userId, id, link]);
        res.status(201).json({ message: 'Challenge submitted'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getAllLeaderboard = async (req, res) => {
    try {
        const [leaderboard] = await pool.query(`
            SELECT
                u.name AS name,
                u.imageUrl AS imageUrl,
                u.point AS totalScore
            FROM
                users u
            WHERE
                u.role = 'USER'
            GROUP BY
                u.id
            ORDER BY
                totalScore DESC
        `);

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


module.exports = {
    getChallenges,
    getChallengeById,
    submitChallenge,
    getAllLeaderboard
}