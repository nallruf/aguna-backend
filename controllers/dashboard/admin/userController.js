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
                COUNT(CASE WHEN t.type = 'EVENT' THEN t.id END) AS totalEvent,
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