const pool = require('../config/db');
const { get } = require('../routes');

const checkPromo = async (req, res) => {
    try{
        const { promoCode, totalPrice} = req.body;

        const [data] =  await pool.query(`
            SELECT * FROM promo WHERE code = ? 
        `, [promoCode]);
        
        if(data.length === 0){
            return res.status(404).json({ message: 'Promo code not found' });
        }

        const discountAmount = (data[0].percent / 100) * totalPrice;
        const newPrice = totalPrice - discountAmount;
        
        const response = {
            discountAmount,
            newTotalPrice : newPrice
        };

        return res.status(200).json(response);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCourseTransaction = async (req, res) => {
    try{
        const { courseId } = req.params;

        const [courseRows] = await pool.query(`
            SELECT c.id AS courseId, c.name AS courseName, c.price AS coursePrice
            FROM course c
            WHERE c.id = ?
        `, [courseId]);

        if (courseRows.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        };

        const course = courseRows[0];

        const [bankRows] = await pool.query(`
            SELECT b.id AS bankId, b.name AS bankName, b.no AS bankNo, b.imageUrl AS bankImageUrl
            FROM bank b
            WHERE b.tag = 'AGUNA'
        `);

        const servicePrice = 50000;
        const totalPrice = course.coursePrice + servicePrice;

        const response = {
            course: {
                id: course.courseId,
                name: course.courseName,
                price: course.coursePrice
            },
            bank: bankRows,
            servicePrice: servicePrice,
            totalPrice: totalPrice
        };

        return res.status(200).json(response);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

};

const createCourseTransaction = async (req, res) => {
    const { courseId } = req.params;
    const userId  = req.user.userId;
    const { price, serviceFee, totalPrice, promoCode, bankId } = req.body;

    try {
        await pool.query('START TRANSACTION');

        const [transactionResult] = await pool.query(`
            INSERT INTO transaction (date, paymentDeadline, type, status, courseId, userId)
            VALUES (NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), 'COURSE', 'UNPAID', ?, ?)
        `, [courseId, userId]);

        const transactionId = transactionResult.insertId;

        await pool.query(`
            INSERT INTO detailTransaction (transactionId, price, serviceFee, totalPrice, bankId, promoId)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [transactionId, price, serviceFee, totalPrice, bankId, promoCode ? promoCode : null]);

        await pool.query('COMMIT');

        res.status(201).json({
            message: 'Transaction created successfully',
            transactionId,
        });
    } catch (error) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    }

};

module.exports = {
    checkPromo,
    getCourseTransaction,
    createCourseTransaction
}; 
