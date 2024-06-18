const pool = require('../../../config/db');
const { get } = require('../../../routes');
const fs = require('fs-extra');
const path = require('path');

const getRole = async (req, res) => {
    try {
        const [roles] = await pool.query(`
                SELECT
                r.id AS role_id,
                r.name AS role_name,
                COUNT(DISTINCT p.id) AS total_path,
                COUNT(DISTINCT pf.id) AS total_path_focus,  
                COUNT(DISTINCT c.id) AS total_course,
                COUNT(DISTINCT uc.id) AS total_student
                FROM
                    role r
                LEFT JOIN
                    path p ON r.id = p.roleId
                LEFT JOIN
                    pathFocus pf ON p.id = pf.pathId
                LEFT JOIN
                    course c ON pf.id = c.pathFocusId
                LEFT JOIN
                    userCourse uc ON c.id = uc.courseId
                GROUP BY
                    r.id;
            `);
            res.json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createRole = async (req, res) => {
    const { name, description } = req.body;
    try {
        console.log(name);
        const [roles] = await pool.query('INSERT INTO role (name, description) VALUES (?, ?)', [name, description]);
        res.json({ message: 'Role has been added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateRole = async (req, res) => {
    const { roleId } = req.params;
    const { name, description } = req.body;
    try {
        const [roles] = await pool.query(`
            UPDATE role 
            SET
                name = ?,
                description = ?    
            WHERE id = ?
            `, [name, description , roleId]);
        res.json({ message: 'Role has been updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteRole = async (req, res) => {
    const { roleId } = req.params;
    try {
        const [paths] = await pool.query(`SELECT id FROM path WHERE roleId = ?`, [roleId]);

        for (const path of paths) {
            await deletePathById(path.id);
        }

        const [test] = await pool.query(`SELECT testId FROM role WHERE id = ?`, [roleId]);

        if (test[0].testId) {
            await deleteTestById(test[0].testId);
        }

        const [roles] = await pool.query('DELETE FROM role WHERE id = ?', [roleId]);
        res.json({ message: 'Role has been deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getRoleById = async (req, res) => {
    const { roleId } = req.params;

    try {
        const [role] = await pool.query(`
            SELECT
                r.id AS id,
                r.name AS name,
                r.description AS description
            FROM
                role r
            WHERE
                r.id = ?
            `, [roleId]);
        res.json(role);
    }catch(error) {
        res.status(500).json({ error: error.message });
    }

}

const getDetailRole = async (req, res) => {
    const { roleId } = req.params;
    try {
        const [role] = await pool.query(`
            SELECT
                    r.id AS role_id,
                    r.name AS role_name,
                    COUNT(DISTINCT p.id) AS total_path,
                    COUNT(DISTINCT pf.id) AS total_path_focus,
                    COUNT(DISTINCT c.id) AS total_course,
                    COUNT(DISTINCT t.id) AS total_test,
                    COUNT(DISTINCT uc.id) AS total_student,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', p.id,
                            'name', p.name,
                            'imageurl', p.imageUrl,
                            'description', p.description
                        ) 
                    ) AS paths,
                    JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', t.id,
                            'name', t.name,
                            'description', t.description,
                            'duration', t.duration,
                            'skills', (
                                SELECT JSON_ARRAYAGG(
                                    JSON_OBJECT(
                                        'id', s.id,
                                        'name', s.name
                                    )
                                )
                                FROM testSkills ts
                                JOIN skills s ON ts.skillId = s.id
                                WHERE ts.testId = t.id
                            )
                        )
                    ) AS tests
                FROM
                    role r
                LEFT JOIN
                    path p ON r.id = p.roleId
                LEFT JOIN
                    pathFocus pf ON p.id = pf.pathId
                LEFT JOIN
                    course c ON pf.id = c.pathFocusId
                LEFT JOIN
                    test t ON r.testId = t.id
                LEFT JOIN
                    userCourse uc ON c.id = uc.courseId
                WHERE
                    r.id = ?
                GROUP BY
                    r.id;

        `, [roleId]);

        if (role.length === 0) {
            return res.status(404).json({ error: 'Role not found' });
        }

        const uniqueData = role.map(item => ({
            ...item,
            paths: [...new Set(item.paths.map((path) => JSON.stringify(path)))]
                .map((path) => JSON.parse(path)),
            tests: item.tests.length > 0 ? {
                    id: item.tests[0].id,
                    name: item.tests[0].name,
                    description: item.tests[0].description,
                    duration: item.tests[0].duration,
                    skills: item.tests[0].skills.map(skill => ({
                        id: skill.id,
                        name: skill.name
                    }))
                } : null
        }));

        res.json(uniqueData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



const createPath = async (req, res ) => {
   const { roleId } = req.params;
   const { name, description } = req.body;
   const imageUrl = req.file ? req.file.filename : null;

   try {
        const [path] = await pool.query(`
            INSERT INTO 
                path (name, imageUrl, description, roleId)
            VALUES (?, ?, ?, ?)
            `, [name, imageUrl, description, roleId]);
        res.json({ message: 'Path has been added' });
   } catch (error) {
        res.status(500).json({ error: error.message });
   }
};

const getPathById = async (req, res) => {
    const { pathId } = req.params;
        
    try {
        const [path] = await pool.query(`
            SELECT
                p.id AS id,
                p.name AS name,
                p.imageUrl AS imageUrl,
                p.description AS description
            FROM
                path p
            WHERE
                p.id = ?
            `, [pathId]);
        
        res.json(path);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updatePath = async (req, res) => {
    const { pathId } = req.params;
    let { name, description } = req.body;
    let image = req.file ? req.file.filename : null;

    try {
        const [getPath] = await pool.query(`
            SELECT *
            FROM 
                path
            WHERE
                id = ?
            `,[pathId]);
        
        if (!getPath[0]) {
            return res.status(404).json({ error: 'Path not found' });
        }

        if (name === null || name === undefined || name === '') {
            name = getPath[0].name;
        }

        if (description === null || description === undefined || description === '') {
            description = getPath[0].description;
        }

        // if (image === null || image === undefined || image === '') {
        //     // await fs.unlink(path.join(`public/images/${getPath[0].imageUrl}`))
        //     image = getPath[0].imageUrl;
        // }


        const imageUrl = image || getPath[0].imageUrl;

        if (name === getPath[0].name &&
            description === getPath[0].description &&
            image === getPath[0].imageUrl) {
            return res.json({ message: 'No changes detected' });
        }

        const [result] = await pool.query(`
            UPDATE path
            SET name = ?, description = ?, imageUrl = ?
            WHERE id = ?
        `, [name, description, image, pathId]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to update path' });
        }

        await fs.unlink(path.join(`public/images/${getPath[0].imageUrl}`))

        res.json({ message: 'Path updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deletePathById = async (req, res) => {
    const { pathId } = req.params;

    try {
        const [pathFocus] = await pool.query(`SELECT id FROM pathFocus WHERE pathId = ?`, [pathId]);

        for (const path of pathFocus) {
            await deletePathFocusById(path.id);
        }

        const [path] = await pool.query('DELETE FROM path WHERE id = ?', [pathId]);

        res.json({ message: 'Path has been deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const deletePath = async (req, res) => {
    const { pathId } = req.params;

    try {
        const [pathFocus] = await pool.query(`SELECT id FROM pathFocus WHERE pathId = ?`, [pathId]);

        for (const path of pathFocus) {
            await deletePathFocusById(path.id);
        }

        const [path] = await pool.query('DELETE FROM path WHERE id = ?', [pathId]);

        res.json({ message: 'Path has been deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getDetailPath = async (req, res) => {
    const { pathId } = req.params;
    try {
        const [paths] = await pool.query(`
            SELECT
                p.id AS id,
                p.name AS name,
                p.imageUrl AS imageUrl,
                p.description AS description,
                COUNT(DISTINCT pf.id) AS totalPathFocus,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', pf.id,
                        'name', pf.name,
                        'description', pf.description,
                        'imageurl', pf.imageUrl
                    )
                ) AS path_focus
            FROM
                path p
            LEFT JOIN
                pathFocus pf ON p.id = pf.pathId
            WHERE
                p.id = ?
            GROUP BY
                p.id;
        `, [pathId]);

        if (paths.length === 0) {
            return res.status(404).json({ error: 'Path not found' });
        }

        res.json(paths);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createPathFocus = async (req, res ) => {
    const { pathId } = req.params;
    const { name, description } = req.body;
    const imageUrl = req.file ? req.file.filename : null;

    try {
        const [pathFocus] = await pool.query(`
            INSERT INTO 
                pathFocus (name, imageUrl, description, pathId)
            VALUES (?, ?, ?, ?)
            `, [name, imageUrl, description, pathId]);

        res.json({ message: 'Path Focus has been added' });
     } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPathFocusById = async (req, res) => {
    const { pathFocusId } = req.params;

    try {
        const [pathFocus] = await pool.query(`
            SELECT
                pf.id AS id,
                pf.name AS name,
                pf.imageUrl AS imageUrl,
                pf.description AS description
            FROM
                pathFocus pf
            WHERE
                pf.id = ?
            `, [pathFocusId]);
        
        res.json(pathFocus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updatePathFocus = async (req, res) => {
    const { pathFocusId } = req.params;
    let { name, description } = req.body;
    let image = req.file ? req.file.filename : null;

    try {
        const [getPath] = await pool.query(`
            SELECT *
            FROM 
                pathFocus
            WHERE
                id = ?
            `,[pathFocusId]);
        
        if (!getPath[0]) {
            return res.status(404).json({ error: 'Path Focus not found' });
        }

        if (name === null || name === undefined || name === '') {
            name = getPath[0].name;
        }

        if (description === null || description === undefined || description === '') {
            description = getPath[0].description;
        }

        const imageUrl = image || getPath[0].imageUrl;

        if (name === getPath[0].name &&
            description === getPath[0].description &&
            imageUrl === getPath[0].imageUrl) {
            return res.json({ message: 'No changes detected' });
        }

        const [result] = await pool.query(`
            UPDATE pathFocus
            SET name = ?, description = ?, imageUrl = ?
            WHERE id = ?
        `, [name, description, imageUrl, pathFocusId]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to update path focus' });
        }

        await fs.unlink(path.join(`public/images/${getPath[0].imageUrl}`))

        res.json({ message: 'Path focus updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deletePathFocusById = async (pathFocusId, res) => {

    try {
        const [courses] = await pool.query('SELECT id FROM course WHERE pathFocusId = ?', [pathFocusId]);

        console.log(courses)
        for (const course of courses){
            
            await deleteCourseById(course.id);
        }

        const [pathFocus] = await pool.query('DELETE FROM pathFocus WHERE id = ?', [pathFocusId]);

        res.json({ message: 'Path Focus has been deleted' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}


const deletePathFocus = async (req, res) => {
    const { pathFocusId } = req.params;

    try {
        const [courses] = await pool.query('SELECT id FROM course WHERE pathFocusId = ?', [pathFocusId]);

        for (const course of courses){
            await deleteCourseById(course.id);
        }

        const [pathFocus] = await pool.query('DELETE FROM pathFocus WHERE id = ?', [pathFocusId]);

        res.json({ message: 'Path Focus has been deleted' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getDetailPathFocus = async (req, res) => {
    const { pathFocusId } = req.params;

    try {
        const [pathFocus] = await pool.query(`
            SELECT
                pf.id AS id,
                pf.name AS name,
                pf.imageUrl AS imageUrl,
                pf.description AS description,
                COUNT(DISTINCT c.id) AS totalCourse,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', c.id,
                        'name', c.name,
                        'description', c.description,
                        'imageUrl', c.imageUrl,
                        'totalStudent', (
                            SELECT
                                COUNT(uc.id)
                            FROM
                                userCourse uc
                            WHERE
                                uc.courseId = c.id
                        )
                    )
                ) AS courses
            FROM
                pathFocus pf
            LEFT JOIN
                course c ON pf.id = c.pathFocusId
            LEFT JOIN
                userCourse uc ON c.id = uc.courseId
            WHERE
                pf.id = ?
            GROUP BY
                pf.id;
        `, [pathFocusId]);

        res.json(pathFocus)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getMentor = async (req, res) => {
    try {
        const [mentors] = await pool.query(`
            SELECT
                m.id AS id,
                u.name AS name,
                u.imageUrl AS imageUrl,
                u.email AS email,
                m.job AS job,
                (
                    SELECT COUNT(*)
                    FROM
                        userCourse uc
                    WHERE
                        uc.courseId IN (
                            SELECT id
                            FROM course
                            WHERE mentorId = m.id
                    )
                ) AS totalStudent
            FROM
                mentor m
            LEFT JOIN
                users u ON m.userId = u.id
            GROUP BY m.id
        `);

        res.json(mentors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const getSpeaker = async (req, res) => {

}

const createCourse = async (req, res ) => {
    const { pathFocusId } = req.params;
    const { name, description, price, level, mentorId, method, skills, tools} = req.body;
    const image = req.file ? req.file.filename : null;

    try {
        const [course] = await pool.query(`
            INSERT INTO
                course (name, description, price, level, mentorId, method, imageUrl, pathFocusId)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [name, description, price, level, mentorId, method, image, pathFocusId]);

            const courseId = course.insertId;

            console.log(skills)

            if (skills && skills.length > 0) {
                const courseSkills = skills.map(skillId => [courseId, skillId]);
                await pool.query('INSERT INTO courseSkills (courseId, skillId) VALUES ?', [courseSkills]);
            }

            if (tools && tools.length > 0) {
                const courseTools = tools.map(skillId => [courseId, skillId]);
                await pool.query('INSERT INTO courseTools (courseId, skillId) VALUES ?', [courseTools]);
            }
        
        res.json({ message: 'Course has been added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getCourseById = async (req, res) => {
    const { courseId } = req.params;

    try {
        const [course] = await pool.query(`
            SELECT
                c.id AS id,
                c.name AS name,
                c.description AS description,
                c.price AS price,
                c.level AS level,
                c.mentorId AS mentorId,
                c.method AS method,
                c.imageUrl AS imageUrl
            FROM
                course c
            WHERE
                c.id = ?
            `, [courseId]);
        
        res.json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateCourse = async (req, res) => {
    const { courseId } = req.params;
    let { name, description, price, level, mentorId, method } = req.body;
    let image = req.file ? req.file.filename : null;

    try {
        const [getCourse] = await pool.query(`
            SELECT *
            FROM
                course
            WHERE
                id = ?
            `, [courseId]);
        
        if (!getCourse[0]) {
            return res.status(404).json({ error: 'Course not found' });
        }

        if (name === null || name === undefined || name === '') {
            name = getCourse[0].name;
        }

        if (description === null || description === undefined || description === '') {
            description = getCourse[0].description;
        }

        if (price === null || price === undefined || price === '') {
            price = getCourse[0].price;
        }

        if (level === null || level === undefined || level === '') {
            level = getCourse[0].level;
        }
    
        if (mentorId === null || mentorId === undefined || mentorId === '') {
            mentorId = getCourse[0].mentorId;
        }

        if (method === null || method === undefined || method === '') {
            method = getCourse[0].method;
        }

        const imageUrl = image || getCourse[0].imageUrl;

        if (name === getCourse[0].name &&
            description === getCourse[0].description &&
            price === getCourse[0].price &&
            level === getCourse[0].level &&
            mentorId === getCourse[0].mentorId &&
            method === getCourse[0].method &&
            imageUrl === getCourse[0].imageUrl) {
            return res.json({ message: 'No changes detected' });
        }

        const [result] = await pool.query(`
            UPDATE course
            SET name = ?, description = ?, price = ?, level = ?, mentorId = ?, method = ?, imageUrl = ?
            WHERE id = ?
        `, [name, description, price, level, mentorId, method, imageUrl, courseId]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to update course' });
        }

        await fs.unlink(path.join(`public/images/${getCourse[0].imageUrl}`))

        res.json({ message: 'Course updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteCourseById = async (courseId, res) => {

    try {
        const [courseSkills] = await pool.query('DELETE FROM courseSkills WHERE courseId = ?', [courseId]);
        const [courseTools] = await pool.query('DELETE FROM courseTools WHERE courseId = ?', [courseId]);
        const [userCourse] = await pool.query('DELETE FROM userCourse WHERE courseId = ?', [courseId]);
        const ucId = userCourse.deleteId;
        const [testimoni] = await pool.query('DELETE FROM testimoni WHERE userCourseId = ?', [ucId]);
        const [material] = await pool.query('DELETE FROM material WHERE courseId = ?', [courseId]);
        const [course] = await pool.query('DELETE FROM course WHERE id = ?', [courseId]);
        res.json({ message: 'Course has been deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const deleteCourse = async (req, res) => {
    const { courseId } = req.params;

    try {
        const [courseSkills] = await pool.query('DELETE FROM courseSkills WHERE courseId = ?', [courseId]);
        const [courseTools] = await pool.query('DELETE FROM courseTools WHERE courseId = ?', [courseId]);
        const [userCourse] = await pool.query('DELETE FROM userCourse WHERE courseId = ?', [courseId]);
        const ucId = userCourse.deleteId;
        const [testimoni] = await pool.query('DELETE FROM testimoni WHERE userCourseId = ?', [ucId]);
        const [material] = await pool.query('DELETE FROM material WHERE courseId = ?', [courseId]);
        const [course] = await pool.query('DELETE FROM course WHERE id = ?', [courseId]);
        res.json({ message: 'Course has been deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const getDetailCourse = async (req, res) => {
    const { courseId } = req.params;

    try {
        const [course] = await pool.query(`
            SELECT
                c.id AS id,
                c.name AS name,
                c.description AS description,
                c.price AS price,
                c.level AS level,
                c.method AS method,
                c.imageUrl AS imageUrl,
                COUNT(DISTINCT uc.id) AS totalStudent,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', s.id,
                        'name', s.name
                    )
                ) AS skills,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', t.id,
                        'name', t.name
                    )
                ) AS tools,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', mt.id,
                        'name', mt.name,
                        'video', mt.video,
                        'materi', mt.materi
                    )
                ) AS materials,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', m.id,
                        'name', u.name,
                        'job', m.job

                    )   
                ) AS mentor
            FROM
                course c
            LEFT JOIN
                mentor m ON c.mentorId = m.id
            LEFT JOIN
                users u ON m.userId = u.id
            LEFT JOIN
                userCourse uc ON c.id = uc.courseId
            LEFT JOIN
                courseSkills cs ON c.id = cs.courseId
            LEFT JOIN
                skills s ON cs.skillId = s.id
            LEFT JOIN
                courseTools ct ON c.id = ct.courseId
            LEFT JOIN
                tools t ON ct.toolId = t.id
            LEFT JOIN
                material mt ON c.id = mt.courseId
            WHERE
                c.id = ?
            GROUP BY
                c.id;
        `, [courseId]);

        if (course.length === 0) {
            return res.status(404).json({ error: 'Course not found' });
        }

        const uniqueData = course.map(item => ({
            ...item,
            skills: [...new Set(item.skills.map((skill) => JSON.stringify(skill)))]
                .map((skill) => JSON.parse(skill)),
            tools: [...new Set(item.tools.map((tool) => JSON.stringify(tool)))]
                .map((tool) => JSON.parse(tool)),
            materials: [...new Set(item.materials.map((material) => JSON.stringify(material)))]
                .map((material) => JSON.parse(material)),
            mentor: [...new Set(item.mentor.map((mentor) => JSON.stringify(mentor)))]
                .map((mentor) => JSON.parse(mentor))
        }));

        res.json(uniqueData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createMaterial = async (req, res) => {
    const { courseId } = req.params;
    const {name, video, materi} = req.body;

    try {

        console.log(name)
        const [material] = await pool.query(`
            INSERT INTO
                material (name, video, materi, courseId)
            VALUES (?, ?, ?, ?)
        `, [name, video, materi, courseId]);

        res.json({ message: 'Material has been added' });
        
    } catch (error) {
        return res.status(404).json({ error: 'Course not found' });
    }
}

const getMaterialById = async (req, res) => {
    const { materialId } = req.params;

    try {
        const [material] = await pool.query(`
            SELECT
                m.id AS id,
                m.name AS name,
                m.video AS video,
                m.materi AS materi
            FROM
                material m
            WHERE
                m.id = ?
        `, [materialId]);

        res.json(material);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateMaterial = async (req, res) => {
    const { materialId } = req.params;
    const { name, video, materi } = req.body;

    try {
        const [getMaterial] = await pool.query(`
            SELECT *
            FROM
                material
            WHERE
                id = ?
            `, [materialId]);
        
        if (!getMaterial[0]) {
            return res.status(404).json({ error: 'Material not found' });
        }

        if (name === null || name === undefined || name === '') {
            name = getMaterial[0].name;
        }

        if (video === null || video === undefined || video === '') {
            video = getMaterial[0].video;
        }

        if (materi === null || materi === undefined || materi === '') {
            materi = getMaterial[0].materi;
        }

        if (name === getMaterial[0].name &&
            video === getMaterial[0].video &&
            materi === getMaterial[0].materi) {
            return res.json({ message: 'No changes detected' });
        }

        const [result] = await pool.query(`
            UPDATE material
            SET name = ?, video = ?, materi = ?
            WHERE id = ?
        `, [name, video, materi, materialId]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to update material' });
        }       

        res.json({ message: 'Material updated' });
    } catch (error) {
        return res.status(404).json({ error: 'Course not found' });
    }
}

const deleteMaterialById = async (materialId, res) => {
    try {
        const [material] = await pool.query('DELETE FROM material WHERE id = ?', [materialId]);
        res.json({ message: 'Material has been deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteMaterial = async (req, res) => {
    const { materialId } = req.params;

    try {
        const [material] = await pool.query('DELETE FROM material WHERE id = ?', [materialId]);
        res.json({ message: 'Material has been deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createTest = async (req, res ) => {
   const { roleId } = req.params;
   const { name, duration, description, skills } = req.body;

   try {
        const [path] = await pool.query(`
            INSERT INTO 
                test (name, description, duration)
            VALUES (?, ?, ?)
            `, [name, description, duration]);

        const testId = path.insertId;

        if (skills && skills.length > 0) {
            const testSkills = skills.map(skillId => [testId, skillId]);
            await pool.query('INSERT INTO testSkills (testId, skillId) VALUES ?', [testSkills]);
        }

        const [role] = await pool.query(`
            UPDATE role
            SET testId = ?
            WHERE id = ?
            `, [testId, roleId]);


        res.json({ message: 'Test has been added' });
   } catch (error) {
        res.status(500).json({ error: error.message });
   }
};


const getTestById = async (req, res) => {
    const { testId } = req.params;

    try {
        const [test] = await pool.query(`
            SELECT
                t.id AS id,
                t.name AS name,
                t.description AS description,
                t.duration AS duration,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', s.id,
                        'name', s.name
                    )
                ) AS skills
            FROM
                test t
            LEFT JOIN
                testSkills ts ON t.id = ts.testId
            LEFT JOIN
                skills s ON ts.skillId = s.id
            WHERE
                t.id = ?
            `, [testId]);
        
        res.json(test);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateTest = async (req, res) => {
    const { testId } = req.params;
    let { name, duration, description } = req.body;

    try {
        const [getTest] = await pool.query(`
            SELECT *
            FROM
                test
            WHERE
                id = ?
            `, [testId]);
        
        if (!getTest[0]) {
            return res.status(404).json({ error: 'Test not found' });
        }

        if (name === null || name === undefined || name === '') {
            name = getTest[0].name;
        }

        if (description === null || description === undefined || description === '') {
            description = getTest[0].description;
        }

        if (duration === null || duration === undefined || duration === '') {
            duration = getTest[0].duration;
        }

        if (name === getTest[0].name &&
            description === getTest[0].description &&
            duration === getTest[0].duration ) {
            return res.json({ message: 'No changes detected' });
        }

        const [result] = await pool.query(`
            UPDATE test
            SET name = ?, description = ?, duration = ?
            WHERE id = ?
        `, [name, description, duration, testId]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Failed to update test' });
        }

        res.json({ message: 'Test updated' });
        
    } catch (error) {
    res.status(500).json({ error: error.message });
    }  
}

const deleteTestById = async (testId, res) => {
    try {
        const [testSkills] = await pool.query('DELETE FROM testSkills WHERE testId = ?', [testId]);
        const [testQuestion] = await pool.query('DELETE FROM testQuestion WHERE testId = ?', [testId]);
        const questionId = testQuestion.deleteId;
        const [testAnswer] = await pool.query('DELETE FROM testAnswer WHERE questionId = ?', [questionId]);
        const [role] = await pool.query('UPDATE role SET testId = NULL WHERE testId = ?', [testId]);
        const [test] = await pool.query('DELETE FROM test WHERE id = ?', [testId]);
        res.json({ message: 'Test has been deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const deleteTest = async (req, res) => {
    const { testId } = req.params;

    try {
        const [testSkills] = await pool.query('DELETE FROM testSkills WHERE testId = ?', [testId]);
        const [testQuestion] = await pool.query('DELETE FROM testQuestion WHERE testId = ?', [testId]);
        const questionId = testQuestion.deleteId;
        const [testAnswer] = await pool.query('DELETE FROM testAnswer WHERE questionId = ?', [questionId]);
        const [role] = await pool.query('UPDATE role SET testId = NULL WHERE testId = ?', [testId]);
        const [test] = await pool.query('DELETE FROM test WHERE id = ?', [testId]);
        res.json({ message: 'Test has been deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getDetailTest = async (req, res) => {
    const { testId } = req.params;

    try {
        const [test] = await pool.query(`
            SELECT
                t.id AS id,
                t.name AS name,
                t.description AS description,
                t.duration AS duration,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', s.id,
                        'name', s.name
                    )
                ) AS skills,
                COUNT (DISTINCT q.id) AS totalQuestion,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', q.id,
                        'question', q.question,
                        'score', q.score
                        ) 
                ) AS questions
            FROM
                test t
            LEFT JOIN
                testSkills ts ON t.id = ts.testId
            LEFT JOIN
                skills s ON ts.skillId = s.id
            LEFT JOIN
                testQuestion q ON t.id = q.testId
            WHERE
                t.id = ?
            `, [testId]);
        
        const uniqueData = test.map(item => ({
            ...item,
            skills: [...new Set(item.skills.map((skill) => JSON.stringify(skill)))]
                .map((skill) => JSON.parse(skill)),
            questions: item.questions.length > 0 ? {
                id: item.questions[0].id,
                question: item.questions[0].question,
                score: item.questions[0].score
            } : null
        }));
        

        res.json(uniqueData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const createQuestion = async (req, res ) => {
    const { testId } = req.params;
    const { question, score, answers } = req.body;

    try {
        const [questions] = await pool.query(`
            INSERT INTO 
                testQuestion (question, score, testId)
            VALUES (?, ?, ?)
            `, [question, score, testId]);

        const questionId = questions.insertId;

        for (const answer of answers) {
            const { answerText, isCorrect } = answer;
            await pool.query(`
                INSERT INTO testAnswer (questionId, answer, isCorrect)
                VALUES (?, ?, ?)
            `, [questionId, answerText, isCorrect]);
        }

        res.json({ message: 'Question and answers has been added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const getQuestionById = async (req, res) => {
    const { questionId } = req.params;

    try {
        const [question] = await pool.query(`
            SELECT
                q.id AS id,
                q.question AS question,
                q.score AS score,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', a.id,
                        'answer', a.answer,
                        'isCorrect', a.isCorrect
                    )
                ) AS answers,
                q.id AS testId
            FROM
                testQuestion q
            LEFT JOIN
                testAnswer a ON q.id = a.questionId
            WHERE
                q.id = ?
            `, [questionId]);
        
        res.json(question);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

const updateQuestion = async (req, res) => {
    const { questionId } = req.params;
    const { testId, question, score, answers } = req.body;

    try {
        const [questions] = await pool.query(`
            INSERT INTO 
                testQuestion (question, score, testId)
            VALUES (?, ?, ?)
            `, [question, score, testId]);

        const newQuestionId = questions.insertId;

        for (const answer of answers) {
            const { answerText, isCorrect } = answer;
            await pool.query(`
                INSERT INTO testAnswer (questionId, answer, isCorrect)
                VALUES (?, ?, ?)
            `, [newQuestionId, answerText, isCorrect]);
        }

        deleteQuestionById(questionId);

        res.json({ message: 'Question and answers has been update' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteQuestionById = async (questionId, res) => {
    try {
        const [asnwers] = await pool.query('DELETE FROM testAnswer WHERE questionId = ?', [questionId]);

        const [question] = await pool.query('DELETE FROM testQuestion WHERE id = ?', [questionId]);
        res.json({ message: 'Question and answer has been deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
        

const deleteQuestion = async (req, res) => {
    const { questionId } = req.params;

    try {
        const [asnwers] = await pool.query('DELETE FROM testAnswer WHERE questionId = ?', [questionId]);

        const [question] = await pool.query('DELETE FROM testQuestion WHERE id = ?', [questionId]);
        res.json({ message: 'Question and answer has been deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    getRole,
    createRole,
    getDetailRole,
    updateRole,
    deleteRole,
    createPath,
    getPathById,
    updatePath,
    deletePath,
    getDetailPath,
    createPathFocus,
    getPathFocusById,
    updatePathFocus,
    deletePathFocus,
    getDetailPathFocus,
    createCourse,
    getCourseById,
    updateCourse,
    deleteCourse,
    getDetailCourse,
    createMaterial,
    getMaterialById,
    updateMaterial,
    deleteMaterial,
    createTest,
    getTestById,
    updateTest,
    deleteTest,
    getDetailTest,
    createQuestion,
    deleteQuestion,
    getRoleById,
    getQuestionById,
    updateQuestion,
    getMentor

}


