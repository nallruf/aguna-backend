const pool = require('../../../config/db');

const getChallenge = async (req, res) => {
    try {
        const [challenge] = await pool.query(`
            SELECT 
                c.id AS id,
                c.title AS title,
                c.shortDescription AS shortDescription,
                c.detailDescription AS detailDescription,
                c.start AS start,
                c.end AS end,
                c.imageUrl AS imageUrl,
                c.totalWinner AS totalWinner,
                 JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', s.id,
                        'name', s.name
                    )
                ) AS skills
            FROM
                challenge c
            LEFT JOIN
                challengeSkills cs ON c.id = cs.challengeId
            LEFT JOIN
                skills s ON cs.skillId = s.id
            GROUP BY c.id
        `);

        res.json(challenge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const createChallenge = async (req, res) => {
    const { title, shortDescription, detailDescription, start, end, imageUrl, skills, totalWinner } = req.body;

    try {
        const [result] = await pool.query(`
            INSERT INTO challenges (title, shortDescription, detailDescription, start, end, imageUrl, totalWinner)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [title, shortDescription, detailDescription, start, end, imageUrl, totalWinner]);

        const challengeId = result.insertId;

        if (skills && skills.length > 0) {
            const challengeSkills = skills.map(skillId => [challengeId, skillId]);
            await pool.query('INSERT INTO challengeSkills (courseId, skillId) VALUES ?', [challengeSkills]);
        }

        res.json({ message: 'Challenge created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateChallenge = async (req, res) => {
    const { challengeId } = req.params;

    let { title, shortDescription, detailDescription, start, end, skills, totalWinner } = req.body;
    let imageUrl = req.file ? req.file.filename : null;

    try {
        const [challenge] = await pool.query(`
            SELECT * FROM challenge WHERE id = ?
        `, [challengeId]);

        if (challenge.length === 0) {
            return res.status(400).json({ error: 'Challenge not found' });
        }

        if (title === null || title === undefined || title === '') {
            title = challenge[0].title;
        }
        if (shortDescription === null || shortDescription === undefined || shortDescription === '') {
            shortDescription = challenge[0].shortDescription;
        }
        if (detailDescription === null || detailDescription === undefined || detailDescription === '') {
            detailDescription = challenge[0].detailDescription;
        }
        if (start === null || start === undefined || start === '') {
            start = challenge[0].start;
        }
        if (end === null || end === undefined || end === '') {
            end = challenge[0].end;
        }
        const imageUrl = image || challenge[0].imageUrl;

        if (title === challenge[0].title &&
            shortDescription === challenge[0].shortDescription &&
            detailDescription === challenge[0].detailDescription &&
            start === challenge[0].start &&
            end === challenge[0].end &&
            imageUrl === challenge[0].imageUrl) {
            return res.json({ message: 'No changes detected' });
        }


        const [result] = await pool.query(`
            UPDATE challenge
            SET title = ?, shortDescription = ?, detailDescription = ?, start = ?, end = ?, imageUrl = ?, totalWinner = ?
            WHERE id = ?
        `, [title, shortDescription, detailDescription, start, end, imageUrl, totalWinner, challengeId]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to update challenge' });
        }

        res.json({ message: 'Challenge updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deleteChallenge = async (req, res) => {
    const { challengeId } = req.params;

    try {
        const [submission] = await pool.query(`
            DELETE FROM submission
            WHERE challengeId = ?
        `, [challengeId]);

        const [result] = await pool.query(`
            DELETE FROM challenge
            WHERE id = ?
        `, [challengeId]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to delete challenge' });
        }
        
        res.json({ message: 'Challenge deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const getChallengeById = async (req, res) => {
    const { challengeId } = req.params;
    try {
        const [challenge] = await pool.query(`
            SELECT 
                c.id AS id,
                c.title AS title,
                c.shortDescription AS shortDescription,
                c.detailDescription AS detailDescription,
                c.start AS start,
                c.end AS end,
                c.imageUrl AS imageUrl,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', s.id,
                        'name', s.name
                    )
                ) AS skills,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', s.id,
                        'link', s.link,
                        'name', u.name,
                        'point', s.score,
                        'winner', s.isWinner
                    )
                ) AS submissions
            FROM
                challenge c
            LEFT JOIN
                challengeSkills cs ON c.id = cs.challengeId
            LEFT JOIN
                skills s ON cs.skillId = s.id
            LEFT JOIN
                submission s ON c.id = s.challengeId
            LEFT JOIN
                users u ON s.userId = u.id
            WHERE c.id = ?
            GROUP BY c.id
        `, [challengeId]);

        res.json(challenge);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



const setScore = async (req, res) => {
    const { submissionId } = req.params;
    const { score } = req.body

    try {
        const [result] = await pool.query(`
            UPDATE submission
            SET score = ?
            WHERE id = ?
        `, [score, submissionId]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to update score' });
        }

        res.json({ message: 'Score updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


    

