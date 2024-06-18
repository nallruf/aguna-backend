const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const blacklist = new Set();

const requestResetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const [users] = await pool.query(`
            SELECT * FROM users WHERE email = ?
        `, [email]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = users[0];

        const [resetPassword] = await pool.query(`
            INSERT INTO reset_password (userId) VALUES (?)
        `, [user.id]);

        res.json({ message: 'Reset password request has been sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const cekUsername = async (req, res) => {
    const { username } = req.body;
};



const register  = async (req, res) => {
    const { name, email, username, password, phoneNumber, universities, skills } = req.body;

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser[0] && existingUser[0].length > 0) {
        console.log(existingUser.length)
      return res.status(400).json({ error: `${email} is already registered`});
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, username, password, phoneNumber, universities) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, username, hashedPassword, phoneNumber, universities]
    );
    const userId = newUser[0].insertId;
    console.log(userId)

    if (skills && skills.length > 0) {

      const userSkills = skills.map(skillId => [userId, skillId]);
      await pool.query('INSERT INTO userSkills (userId, skillId) VALUES ?', [userSkills]);
    }

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }

        
        const validPassword = await bcrypt.compare(password, user[0]?.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid email or password.' });
        }
    
        const token = jwt.sign({ userId: user[0].id, role: user[0].role }, process.env.JWT_SECRET, { expiresIn: '3h' });
        res.header('Authorization', token).json({ message: 'Login successful.', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const logout = (req, res) => {
    const token = req.token; // Token extracted by authMiddleware

    if (token) {
        blacklist.add(token);
        return res.status(200).json({ message: 'Logout successful' });
    }

    res.status(200).json({ message: 'Logout successful' });
};


module.exports = {
    requestResetPassword,
    register,
    login,
    logout,
    blacklist
};