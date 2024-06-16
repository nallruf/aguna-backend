const pool = require('../../../config/db');

const updateProfile = async (req, res) => {
    const userId = req.user.userId;
    const {  username, email, phoneNumber, universities } = req.body;
    const image = req.file ? req.file.filename : null;

    

    try {
        const updateUser = await pool.query(`
            UPDATE users
            SET username = ?, email = ?, phoneNumber = ?, universities = ?, imageUrl = ?
            WHERE id = ?
        `, [username, email, phoneNumber, universities, image, userId]);


        
        res.json({ message: 'Profile updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
        
    }
}

const getProfile = async (req, res) => {
    const userId = req.user.userId;

    try {
        const profile = await pool.query(`
            SELECT id, username, email, phoneNumber, universities, imageUrl
            FROM users
            WHERE id = ?
        `, [userId]);

        res.json(profile[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
        
    }
}



module.exports = {updateProfile, getProfile}