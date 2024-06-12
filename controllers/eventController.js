const pool = require('../config/db');

const getEvents = async (req, res) => {
    try {
        const [events] = await pool.query(`
        SELECT
                e.id AS id,
                e.title AS name,
                e.date AS date,
                e.time AS time,
                e.description AS description,
                e.imageUrl AS imageUrl,
                JSON_ARRAYAGG(
                    JSON_OBJECT('id', s.id, 'name', s.name)
                ) AS skills
            FROM
                event e
                LEFT JOIN eventSkills es ON e.id = es.eventId
                LEFT JOIN skills s ON es.skillId = s.id
            GROUP BY
                e.id;

        `);
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getEventById = async (req, res) => {
    const { id } = req.params;
    try {
        const [data] = await pool.query(`
        SELECT
                e.id AS id,
                e.title AS name,
                e.date AS date,
                e.time AS time,
                e.description AS description,
                e.imageUrl AS imageUrl,
                e.organizer AS organizer,
                e.location AS location,
                e.price AS price,
                JSON_ARRAYAGG(
                    JSON_OBJECT('id', s.id, 'name', s.name)
                ) AS skills,
                JSON_ARRAYAGG(
                    JSON_OBJECT('id', sp.id, 'name', sp.name, 'jobs', sp.jobs, 'imageUrl', sp.imageUrl)
                ) as speakers
            FROM
                event e
                LEFT JOIN eventSkills es ON e.id = es.eventId
                LEFT JOIN skills s ON es.skillId = s.id
                LEFT JOIN eventSpeaker ep ON e.id = ep.eventId
                LEFT JOIN speakers sp ON ep.speakerId = sp.id
            WHERE
                e.id = ?
            GROUP BY
                e.id;
            
    
        `, [id]);

        if (data.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        const event = data.map((item) => ({
            ...item,
            skills: [...new Set(item.skills.map((skill => JSON.stringify(skill))))]
            .map((skill) => JSON.parse(skill)),   
            speakers: [...new Set(item.speakers.map((speaker => JSON.stringify(speaker))))]
            .map((speaker) => JSON.parse(speaker))
        }));
            

        res.json(event[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {  
    getEvents,
    getEventById
}