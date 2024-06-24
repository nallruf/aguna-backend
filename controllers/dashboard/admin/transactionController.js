const pool = require('../../../config/db');

const getTransaction = async (req, res) => {
    try{
        const [transaction] = await pool.query(`
            SELECT
                t.id AS transactionId,
                t.date AS date,
                t.paymentDeadline AS paymentDeadline,
                t.type AS type,
                t.status AS status,
                t.courseId AS courseId,
                t.eventId AS eventId,
                t.userId AS userId,
                dt.id AS detailTransactionId,
                dt.price AS price,
                dt.serviceFee AS serviceFee,
                dt.promoId AS promoId,
                dt.bankId AS bankId,
                dt.totalPrice AS totalPrice,
                dt.imageUrl AS imageUrl
            FROM
                transaction t
            JOIN
                detailTransaction dt ON t.id = dt.transactionId
            GROUP BY t.id

        `);

        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const verifyPayment = async (req, res) => {
    const { transactionId } = req.params;

    try {
        await pool.query('UPDATE transaction SET status = "ACCEPT" WHERE id = ?', [transactionId]);

        const [transaction] = await pool.query('SELECT * FROM transaction WHERE id = ?', [transactionId]);
        const { userId, courseId, eventId } = transaction[0];
        if (courseId) {
            await pool.query('INSERT INTO userCourse (userId, courseId, completionStatus) VALUES (?, ?, "IN PROGRESS")', [userId, courseId]);
        } else if (eventId) {
            await pool.query('INSERT INTO userEvent (userId, eventId) VALUES (?, ?)', [userId, eventId]);
        }

        res.json({ message: 'Payment verified' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const rejectPayment = async (req, res) => {
    const { transactionId } = req.params;

    try {
        await pool.query('UPDATE transaction SET status = "REJECT" WHERE id = ?', [transactionId]);

        res.json({ message: 'Payment rejected' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
module.exports = {
    getTransaction,
    verifyPayment,
    rejectPayment
}