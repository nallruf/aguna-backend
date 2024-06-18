const pool = require('../../../config/db');

const getEvent = async (req, res) => {
    try {
        const [event] = await pool.query(`
            SELECT 
                e.id,
                e.title,
                e.shortDescription,
                e.location,
                e.date,
                e.time,
                e.imageUrl,
                e.organizer,
                e.link,
                e.type,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', s.id,
                        'name', s.name
                    )
                ) AS skills
            FROM
                events e
            LEFT JOIN
                eventSkills es ON e.id = es.eventId
            LEFT JOIN
                skills s ON es.skillId = s.id
            GROUP BY e.id
        `);

        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }   
}

const createEvent = async (req, res) => {
    
    const { title, shortDescription, detailDescription , location, date, time, imageUrl, organizer, link, type , skills} = req.body;

    try {
        const [result] = await pool.query(`
            INSERT INTO events (title, shortDescription, detailDescription,location, date, time, imageUrl, organizer, link, type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [title, shortDescription, detailDescription,location, date, time, imageUrl, organizer, link, type]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to create event' });
        }

        const eventId = result.insertId;

        if (skills && skills.length > 0) {
            const eventSkills = skills.map(skillId => [eventId, skillId]);
            await pool.query('INSERT INTO eventSkills (courseId, skillId) VALUES ?', [eventSkills]);
        }


        res.json({ message: 'Event created' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateEvent = async (req, res) => {
    const { eventId } = req.params;
    let { title, shortDescription, detailDescription, location, date, time, organizer, link, type, price } = req.body;

    let imageUrl = req.file ? req.file.filename : null;

    try {
        const [event] = await pool.query(`
            SELECT *
            FROM events
            WHERE id = ?
        `, [eventId]);

        if (!event[0]) {
            return res.status(404).json({ error: 'Event not found' });
        }

        if (title === null || title === undefined || title === '') {
            title = event[0].title;
        }

        if (shortDescription === null || shortDescription === undefined || shortDescription === '') {
            shortDescription = event[0].shortDescription;
        }

        if (detailDescription === null || detailDescription === undefined || detailDescription === '') {
            detailDescription = event[0].detailDescription;
        }

        if (location === null || location === undefined || location === '') {
            location = event[0].location;
        }

        if (date === null || date === undefined || date === '') {
            date = event[0].date;
        }

        if (time === null || time === undefined || time === '') {
            time = event[0].time;
        }

        if (price === null || price === undefined || price === '') {
            price = event[0].price;
        }

        const imageUrl = image || event[0].imageUrl;

        if (organizer === null || organizer === undefined || organizer === '') {
            organizer = event[0].organizer;
        }

        if (link === null || link === undefined || link === '') {
            link = event[0].link;
        }

        if (type === null || type === undefined || type === '') {
            type = event[0].type;
        }

        if (title === event[0].title &&
            shortDescription === event[0].shortDescription &&
            detailDescription === event[0].detailDescription &&
            location === event[0].location &&
            date === event[0].date &&
            time === event[0].time &&
            price === event[0].price &&
            imageUrl === event[0].imageUrl &&
            organizer === event[0].organizer &&
            link === event[0].link &&
            type === event[0].type) {
            return res.json({ message: 'No changes detected' });
        }

        const [result] = await pool.query(`
            UPDATE events
            SET title = ?, shortDescription = ?, detailDescription = ?, location = ?, date = ?, time = ?, imageUrl = ?, organizer = ?, price = ? ,link = ?, type = ?
            WHERE id = ?
        `, [title, shortDescription, detailDescription, location, date, time, imageUrl, organizer, price, link, type, eventId]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to update event' });
        }

        res.json({ message: 'Event updated' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteEvent = async (req, res) => {
    const { eventId } = req.params;

    try {

        const [eventSpeaker] = await pool.query(`
            DELETE FROM eventSpeakers
            WHERE eventId = ?
        `, [eventId]);

        const [result] = await pool.query(`
            DELETE FROM events
            WHERE id = ?
        `, [eventId]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to delete event' });
        }

        res.json({ message: 'Event deleted' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDetailEvent = async (req, res) => {
    const { eventId } = req.params;

    try {
        const [event] = await pool.query(`
            SELECT 
                e.id,
                e.title,
                e.shortDescription,
                e.detailDescription,
                e.location,
                e.date,
                e.time,
                e.imageUrl,
                e.organizer,
                e.link,
                e.type,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', s.id,
                        'name', s.name
                    )   
                ) AS skills,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', s.id,
                        'name', s.name,
                        'imageUrl', s.imageUrl,
                        'job', s.job
                        )
                ) AS speakers
            FROM
                events e
            LEFT JOIN
                eventSpeakers es ON e.id = es.eventId
            LEFT JOIN
                speakers s ON e.id = es.speakerId
            LEFT JOIN
                eventSkills sk ON e.id = sk.eventId
            LEFT JOIN
                skills s ON sk.skillId = s.id
            WHERE
                e.id = ?
        `, [eventId]);

        if (!event[0]) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.json(event[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addSpeaker = async (req, res) => {
    const { eventId } = req.params;
    const { name, imageUrl, job } = req.body;

    try {
        const [result] = await pool.query(`
            INSERT INTO speakers (name, imageUrl, job, eventId)
            VALUES (?, ?, ?, ?)
        `, [name, imageUrl, job, eventId]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to add speaker' });
        }

        const speakerId = result.insertId;

        const [eventSpeaker] = await pool.query(`
            INSERT INTO eventSpeakers (eventId, speakerId)
            VALUES (?, ?)
        `, [eventId, speakerId]);

        if (eventSpeaker.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to add event speaker' });
        }

        res.json({ message: 'Speaker added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteSpeaker = async (req, res) => {
    const { speakerId } = req.params;

    try {
        const [result] = await pool.query(`
            DELETE FROM eventSpeakers
            WHERE speakerId = ?
        `, [speakerId]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to delete speaker' });
        }

        res.json({ message: 'Speaker deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateSpeaker = async (req, res) => {
    const { speakerId } = req.params;
    const { name, job } = req.body;
    let image = req.file ? req.file.filename : null;

    try {
        const [speaker] = await pool.query(`
            SELECT *
            FROM speakers
            WHERE id = ?
        `, [speakerId]);

        if (!speaker[0]) {
            return res.status(404).json({ error: 'Speaker not found' });
        }

        if (name === null || name === undefined || name === '') {
            name = speaker[0].name;
        }

        if (job === null || job === undefined || job === '') {
            job = speaker[0].job;
        }

        const imageUrl = image || speaker[0].imageUrl;

        if (name === speaker[0].name &&
            job === speaker[0].job &&
            imageUrl === speaker[0].imageUrl) {
            return res.json({ message: 'No changes detected' });
        }

        const [result] = await pool.query(`
            UPDATE speakers
            SET name = ?, imageUrl = ?, job = ?
            WHERE id = ?
        `, [name, imageUrl, job, speakerId]);

        res.json({ message: 'Speaker updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    getEvent,
    createEvent,
    getDetailEvent,
    addSpeaker
};

