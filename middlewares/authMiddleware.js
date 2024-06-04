const jwt = require('jsonwebtoken');
const blacklist = require('../controllers/authController').blacklist; 

require('dotenv').config();

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    console.log(token);

    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        if (blacklist.has(token)) {
            return res.status(401).json({ message: 'Token is blacklisted' });
        }

        const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = decoded;
        req.token = token; // Save token for use in controller
        next();
    } catch (ex) {
        res.status(400).json({ message: 'Invalid token.' + ex});
    }
};

module.exports = { verifyToken };
