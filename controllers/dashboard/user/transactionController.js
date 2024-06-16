const pool = require('../../../config/db');

const getTransaction = async (req, res ) => {
    const userId = req.user.userId;

    try {
        const [transactions] = await pool.query(`
            SELECT
                t.id AS transactionId,
                t.date AS transactionDate,
                t.type AS transactionType,
                t.status AS transactionStatus,
                t.courseId,
                t.eventId,
                CASE
                    WHEN t.type = 'COURSE' THEN c.name
                    WHEN t.type = 'EVENT' THEN e.title
                    ELSE ''
                END AS itemName,
                CASE
                    WHEN t.type = 'COURSE' THEN c.imageUrl
                    WHEN t.type = 'EVENT' THEN e.imageUrl
                    ELSE ''
                END AS itemImageUrl,
                dt.imageUrl AS paymentImageUrl
                FROM
                    transaction t
                LEFT JOIN
                    course c ON t.courseId = c.id AND t.type = 'COURSE'
                LEFT JOIN
                    event e ON t.eventId = e.id AND t.type = 'EVENT'
                LEFT JOIN
                    detailTransaction dt ON t.id = dt.transactionId
                WHERE
                    t.userId = ?
                `, [userId])
        
        res.json(transactions)
    } catch (error) {
        res.status(500).json({ error : error.message });
    }

}

module.exports = {
    getTransaction
}