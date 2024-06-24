const pool = require('../../../config/db');


const getFinishCourse = async (req, res) => {
    const userId = req.user.userId;

    try {
        const [finishCourse] = await pool.query(`
            SELECT
                uc.id AS userCourseId,
                COUNT(t.id) AS statusFeedback,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'courseId', c.id,
                        'role', r.name,
                        'courseName', c.name,
                        'courseLevel', c.level,
                        'description', c.description,
                        'method', c.method,
                        'courseImageUrl', c.imageUrl
                    )
                ) AS course
            FROM 
                userCourse uc
            LEFT JOIN
                testimoni t ON uc.id = t.userCourseId
            LEFT JOIN
                course c ON uc.courseId = c.id
            LEFT JOIN
                pathFocus pf ON c.pathFocusId = pf.id
            LEFT JOIN
                path p ON pf.pathId = p.id
            LEFT JOIN
                role r ON p.roleId = r.id
            WHERE
                uc.completionStatus = 'COMPLETED' AND uc.userId = ?
            GROUP BY
                uc.id
        `, [userId, userId]);

        res.json(finishCourse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getInProgressCourse = async (req, res) => {
    const userId = req.user.userId;

    try {
        const [inProgressCourse] = await pool.query(`
            SELECT
                uc.Id AS userCourseId,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'courseId', c.id,
                        'role', r.name,
                        'courseName', c.name,
                        'courseLevel', c.level,
                        'description', c.description,
                        'method', c.method,
                        'courseImageUrl', c.imageUrl,
                        'mentor', JSON_OBJECT(
                            'mentorName', u.name,
                            'mentorImage', u.imageUrl,
                            'mentorJob', m.job
                            )
                    )
                ) AS course
                
            FROM 
                userCourse uc
            LEFT JOIN
                testimoni t ON uc.id = t.userCourseId
            LEFT JOIN
                course c ON uc.courseId = c.id
            LEFT JOIN
                pathFocus pf ON c.pathFocusId = pf.id
            LEFT JOIN
                path p ON pf.pathId = p.id
            LEFT JOIN
                role r ON p.roleId = r.id
            LEFT JOIN
                mentor m ON c.mentorId = m.id
            LEFT JOIN
                users u ON m.userId = u.id
            WHERE
                uc.completionStatus = 'IN_PROGRESS' AND uc.userId = ?
            GROUP BY
                uc.id
        `, [userId, userId]);

        res.json(inProgressCourse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getCourseMaterial = async (req, res) => {
    const userId = req.user.userId;
    const { userCourseId } = req.params;

    try {
        const [courseData] = await pool.query(`
            SELECT
                c.id AS courseId,
                c.name AS courseName,
                c.description AS courseDescription,
                c.imageUrl AS courseImageUrl,
                m.id AS mentorId,
                m.job AS mentorJob,
                u.name AS mentorName,
                u.phoneNumber as contact,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', t.id,
                        'name', t.name,
                        'description', t.description,
                        'imageUrl', t.imageUrl
                    )
                ) AS tools
            FROM
                userCourse uc
            LEFT JOIN
                course c ON uc.courseId = c.id
            LEFT JOIN
                mentor m ON c.mentorId = m.id
            LEFT JOIN
                users u ON m.userId = u.id
            LEFT JOIN
                courseTools ct ON c.id = ct.courseId
            LEFT JOIN
                tools t ON ct.toolId = t.id
            WHERE
                uc.id = ?
            GROUP BY
                c.id
        `, [userCourseId]);
        
        const courseId = courseData[0].courseId;

        const [materials] = await pool.query(`
            SELECT
                m.id AS materialId,
                m.name AS materialName,
                m.video AS materialVideo,
                m.materi AS materialMateri,
                IFNULL(up.progressStatus, false) AS isViewed
            FROM
                material m
            LEFT JOIN
                userCourseProgress up ON m.id = up.materialId AND up.userCourseId = ?
            WHERE
                m.courseId = (
                    SELECT courseId FROM userCourse WHERE id = ?
            );            
            `, [userCourseId, courseId]);

        // const [uniqueMaterial] = materials.

        // skills: [...new Set(item.skills.map(skill => JSON.stringify(skill)))].map(skill => JSON.parse(skill)),
        
        const uniqueMaterial =  [...new Set(materials.map(material => JSON.stringify(material)))].map(material => JSON.parse(material));
            

        const courseWithMaterials = {
                userCourseId: parseInt(userCourseId),
                ...courseData[0],
                materials: uniqueMaterial
            };
        
        res.json(courseWithMaterials)
    } catch (error) {
        res.status(500).json({error: error.message})
    }
}

const saveProgress = async (req, res) => {
    const { userCourseId, materialId } = req.body;

    try {
        await pool.query(`
            INSERT INTO userCourseProgress (userCourseId, materialId, progressStatus)
            VALUES (?, ?, 1)
        `, [userCourseId, materialId]);
        
        res.json({ message: "Material progress saved successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const finishCourse = async (req, res) => {
    const { userCourseId } = req.body;

    try {
        await pool.query(`
            UPDATE userCourse SET completionStatus = 'COMPLETED' WHERE id = ?
        `, [userCourseId]);

        res.json({ message: "Course finished successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const giveTestimoni = async (req, res) => {
    const { userCourseId, quotes } = req.body;

    try {
        const [testimoniExist] = await pool.query(`
            SELECT * FROM testimoni WHERE userCourseId = ?
        `, [userCourseId]);

        if (testimoniExist.length > 0) {
            return res.status(400).json({ message: "Testimoni already given" });
        }

        const [testimoni] = await pool.query(`
                INSERT INTO testimoni (userCourseId, quotes )
                VALUES(?, ?)
            `, [userCourseId, quotes]) 

        res.json({ message : "Testimoni added"})
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getTestimoni = async (req, res) => {
    const { userCourseId } = req.params;

    try {
        const [testimoni] = await pool.query(`
            SELECT * FROM testimoni WHERE userCourseId = ?
        `, [userCourseId]);

        res.json(testimoni);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}



module.exports = {
    getFinishCourse,
    getInProgressCourse,
    getCourseMaterial,
    saveProgress,
    giveTestimoni,
    getTestimoni,
    finishCourse
};
