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


const getEventTransaction = async (req, res) => {
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

const getPaymentDetails = async (req, res) => {
    const userId = req.user.userId; 
    // const userId = 4;
    const {transactionId} = req.params;
  
    try {
      const [transaction] = await pool.query(`
        SELECT 
        t.id AS transactionId, 
        t.date, 
        t.paymentDeadline, 
        d.totalPrice,
        t.status,
        b.No AS bankNo
      FROM transaction t
      JOIN detailTransaction d ON t.id = d.transactionId
      JOIN bank b ON d.bankId = b.id
      WHERE t.id = ? AND t.userId = ?
    `, [transactionId, userId]);
  
      console.log(transaction);
      if (transaction.length === 0) {
        return res.status(404).json({ message: 'Transaction not found.' });
      }
  
      res.json(transaction[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

const uploadPayment = async (req, res) => {
    const userId = req.user.userId;
    // const userId = 4;
    const { transactionId } = req.params;
    const image  = req.file ? req.file.filename : null;
  
    try {

        await pool.query('START TRANSACTION');

        const [upload] = await pool.query(`
            UPDATE detailTransaction
            SET imageUrl = ?
            WHERE transactionId = ?
        `,[image, transactionId]);

        const [transaction] = await pool.query(`
            UPDATE transaction
            SET status = 'PENDING'
            WHERE id = ? AND userId = ?
        `, [transactionId, userId]
        );

        if (upload.affectedRows === 0 || transaction.affectedRows === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({ message: 'Payment failed' });
        }

        await pool.query('COMMIT');
        
  
        
      res.json({
        status: "Success", 
        message: 'Payment proof uploaded successfully',
     });
    } catch (error) {
        await pool.query('ROLLBACK');
      res.status(500).json({ error: error.message });
    }
  };

module.exports = {
    checkPromo,
    getCourseTransaction,
    createCourseTransaction,
    getPaymentDetails,
    uploadPayment
}; 
