const pool = require('../../../config/db');

const updateProfile = async (req, res) => {
    const userId = req.user.userId;
    let {  username, email, phoneNumber, universities } = req.body;
    let image = req.file ? req.file.filename : null;
    

    try {
        const [getUser] = await pool.query(`
            SELECT *
            FROM 
                users
            WHERE
                id = ?
            `,[userId]);

        console.log(getUser[0])

        if (!getUser[0]) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (username === null || username === undefined || username === '') {
            username = getUser[0].username;
        };

        if (email === null || email === undefined || email === '') {
            email = getUser[0].email;
        };

        if (phoneNumber === null || phoneNumber === undefined || phoneNumber === '') {
            phoneNumber = getUser[0].phoneNumber;
        };
        if (universities === null || universities === undefined || universities === '') {
            universities = getUser[0].universities;
        };
        const imageUrl = image || getUser[0].imageUrl;

        if (username === getUser[0].username &&
            email === getUser[0].email &&
            phoneNumber === getUser[0].phoneNumber &&
            universities === getUser[0].universities &&
            imageUrl === getUser[0].imageUrl) {
            return res.json({ message: 'No changes detected' });
        }

        const [result] = await pool.query(`
            UPDATE users
            SET username = ?, email = ?, phoneNumber = ?, universities = ?, imageUrl = ?
            WHERE id = ?
        `, [username, email, phoneNumber, universities, imageUrl, userId]);

        console.log('Update result:', result);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to update profile' });
        }
        
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