const pool = require('../../../config/db');

const getFutureEvent = async (req, res) => {
    const userId = req.user.userId;

    try {
        const [events] = await pool.query(`
                SELECT             
                    e.id AS eventId,
                    e.title AS eventName,
                    e.date AS date,
                    e.time AS time,
                    e.imageUrl AS imageUrl,
                    e.type AS type,
                    e.organizer AS organizer,
                    e.link AS link
                FROM
                    event e
                JOIN
                    transaction t ON e.id = t.eventId
                JOIN
                    users u ON t.userId = u.id
                WHERE
                    t.status = 'ACCEPT'  
                    AND t.type = 'EVENT' 
                    AND e.date >= CURDATE() 
                    AND u.id = ?; 
                
            `, [userId])
        
        res.json(events)
    } catch (error) {
        res.status(500).json({error: error.message})
    }

}

const getFinishEvent = async (req, res) => {
    const userId = req.user.userId;

    try {
        const [events] = await pool.query(`
                SELECT             
                    e.id AS eventId,
                    e.title AS eventName,
                    e.date AS date,
                    e.time AS time,
                    e.imageUrl AS imageUrl,
                    e.type AS type,
                    e.organizer AS organizer
                FROM
                    event e
                JOIN
                    transaction t ON e.id = t.eventId
                JOIN
                    users u ON t.userId = u.id
                WHERE
                    t.status = 'ACCEPT'  
                    AND t.type = 'EVENT' 
                    AND e.date < CURDATE() 
                    AND u.id = ?; 
                
            `, [userId])
        
        res.json(events)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

module.exports = {
    getFutureEvent,
    getFinishEvent
}