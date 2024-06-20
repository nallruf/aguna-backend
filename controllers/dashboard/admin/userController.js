const pool = require('../../../config/db');

const getUsers = async (req, res) => {
    try {
        const [users] = await pool.query(`
            SELECT
                u.id AS id,
                u.name AS name,
                u.email AS email,
                u.imageUrl AS imageUrl,
                COUNT(DISTINCT uc.courseId) AS totalCourse,
                COUNT(DISTINCT s.id) AS totalSubmission,
                COUNT(DISTINCT CASE WHEN t.type = 'EVENT' THEN t.id END) AS totalEvent,
                SUM(
                    CASE
                        WHEN t.status = 'ACCEPT' THEN dt.totalPrice
                        ELSE 0
                    END
                ) AS totalPriceTransaction
            FROM
                users u
            LEFT JOIN
                userCourse uc ON u.id = uc.userId
            LEFT JOIN
                submission s ON u.id = s.userId
            LEFT JOIN
                transaction t ON u.id = t.userId
            LEFT JOIN
                detailTransaction dt ON t.id = dt.transactionId
            WHERE
                u.role = 'USER'
            GROUP BY
                u.id;

        `);

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}

const deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        await pool.query('START TRANSACTION');

        await pool.query('DELETE FROM detailTransaction WHERE transactionId IN (SELECT id FROM transaction WHERE userId = ?)', [userId]);
        await pool.query('DELETE FROM transaction WHERE userId = ?', [userId]);
        await pool.query('DELETE FROM submission WHERE userId = ?', [userId]);
        await pool.query('DELETE FROM userCourse WHERE userId = ?', [userId]);
        await pool.query('DELETE FROM users WHERE id = ?', [userId]);

        await pool.query('COMMIT');

        res.json({ message: 'User and related data deleted' });
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    }
};


const assignMentor = async (req, res) => {
    const { userId } = req.params;
    const { job, nameBank, noBank } = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        const [user] = await pool.query('UPDATE users SET role = "MENTOR" WHERE id = ?', [userId]);

        if (user.affectedRows === 0) {
            return res.status(400).json({ error: 'User not found' });
        }

        const [bank] = await pool.query('INSERT INTO bank (name, no, imageUrl, tag) VALUES (?, ?, ?, "MENTOR")', [nameBank, noBank, image]);

        if (bank.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to create bank' });
        }

        const bankId = bank.insertId

        const [mentor] = await pool.query('INSERT INTO mentor (userId, job, bankId) VALUES (?, ?, ?)', [userId, job, bankId]);

        if (mentor.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to assign mentor' });
        }
        

        res.json({ message: 'User assigned as mentor' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getUsers,
    deleteUser,
    assignMentor
}