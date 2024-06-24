const pool = require("../config/db");
const { get } = require("../routes");

const getDataLanding = async (req, res) => {
  try {
    const [data] = await pool.query(`
        SELECT
        r.id AS role_id,
        r.name AS role_name,
        r.description AS role_description,
        COUNT(DISTINCT p.id) AS total_path,
        COUNT(DISTINCT c.id) AS total_course,
        COUNT(DISTINCT uc.id) AS total_student,
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', p.id,
                'name', p.name,
                'imageUrl', p.imageUrl,
                'description', p.description,
                'totalStudent', COALESCE(ts.total_student, 0)
            )
        ) AS paths
        FROM
            role r
        LEFT JOIN
            path p ON r.id = p.roleId
        LEFT JOIN
            (
                SELECT
                    p.id AS path_id,
                    COUNT(DISTINCT c.id) AS total_course,
                    COUNT(DISTINCT uc.id) AS total_student
                FROM
                    path p
                LEFT JOIN
                    pathFocus pf ON p.id = pf.pathId
                LEFT JOIN
                    course c ON pf.id = c.pathFocusId
                LEFT JOIN
                    userCourse uc ON c.id = uc.courseId
                GROUP BY
                    p.id
            ) ts ON p.id = ts.path_id
        LEFT JOIN
            pathFocus pf ON p.id = pf.pathId
        LEFT JOIN
            course c ON pf.id = c.pathFocusId
        LEFT JOIN
            userCourse uc ON c.id = uc.courseId
        GROUP BY
            r.id;

        `);

        const uniqueData = data.map(item => ({
          ...item,
          paths: [...new Set(item.paths.map(path => JSON.stringify(path)))]
            .map(path => JSON.parse(path))
        }));

    res.json(uniqueData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRoleById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId; 

  try {
    const [paths] = await pool.query(
      `
            SELECT
                p.id AS pathId,
                p.name AS pathName,
                p.description AS pathDescription,
                p.imageUrl AS pathImageUrl,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                            'pathFocusId', pf.id,
                            'pathFocusName', pf.name,
                            'pathFocusDescription', pf.description,
                            'pathFocusImageUrl', pf.imageUrl,
                            'totalCourse', COALESCE(tc.total_course, 0)
                        )
                  ) AS pathFocus
                  
            FROM
                path p
            LEFT JOIN
                pathFocus pf ON p.id = pf.pathId
            LEFT JOIN
                (
                    SELECT
                        pf.id AS pathFocusId,
                        COUNT(DISTINCT c.id) AS total_course
                    FROM
                        pathFocus pf
                    LEFT JOIN
                        course c ON pf.id = c.pathFocusId
                    GROUP BY
                        pf.id
                ) tc ON pf.id = tc.pathFocusId
            LEFT JOIN
                course c ON pf.id = c.pathFocusId
            WHERE
                p.roleId = ?
            GROUP BY
                p.id, p.name, p.description, p.imageUrl;
        `,
      [id]
    );

    if (paths.length === 0) {
      return res.status(404).json({ message: "Paths not found" });
    }

    const [userTests] = await pool.query(
      `
            SELECT status FROM userTests WHERE userId = ? AND testId = (
                SELECT testId FROM role WHERE id = ?
            )
        `,
      [userId, id]
    );

    const testCompleted =
      userTests.length > 0 && userTests[0].status === "COMPLETED";

    const result = paths.map((path) => {
      const isUnlocked =
        path.pathName.toLowerCase().includes("pemula") || testCompleted;

      return {
        ...path,
        lock: !isUnlocked,
      };
    });

    const uniqueData = result.map(item => ({
      ...item,
      pathFocus: [...new Set(item.pathFocus.map(pathFocus => JSON.stringify(pathFocus)))]
        .map(pathFocus => JSON.parse(pathFocus))
    }));

    res.json(uniqueData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPathById = async (req, res) => {
  const { id } = req.params;
  try {
    const [paths] = await pool.query(
      `
        SELECT
            pf.id AS pathFocusId,
            pf.name AS pathFocusName,
            pf.description AS pathFocusDescription,
            COALESCE(
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'courseId', c.id,
                        'courseName', c.name,
                        'courseLevel', c.level,
                        'description', c.description,
                        'totalStudent', (
                            SELECT COUNT(*) 
                            FROM userCourse uc 
                            WHERE uc.courseId = c.id
                        ),
                        'courseImageUrl', c.imageUrl
                    )
                ),
                JSON_ARRAY()
            ) AS courses
        FROM
            pathFocus pf
        LEFT JOIN
            course c ON pf.id = c.pathFocusId
        WHERE
            pf.pathId = ?
        GROUP BY
            pf.id, pf.name;
        
        `,
      [id]
    );

    if (paths.length === 0) {
      return res.status(404).json({ message: "Paths not found" });
    }

    res.json(paths);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCoursesByPathFocusId = async (req, res) => {
  const { pathFocusId } = req.params;
  try {
    const [rows] = await pool.query(
      `
            SELECT
                c.id AS courseId,
                c.name AS courseName,
                c.description AS courseDescription,
                c.level AS courseLevel,
                (
                    SELECT COUNT(*)
                    FROM userCourse uc
                    WHERE uc.courseId = c.id
                ) AS totalStudent,
                c.imageUrl AS courseImageUrl
            FROM
                course c
            WHERE
                c.pathFocusId = ?;
        `,
      [pathFocusId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No courses found for the given pathFocusId" });
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMentorsByPathFocusId = async (req, res) => {
  const { pathFocusId } = req.params;
  try {
    const [rows] = await pool.query(
      `
            SELECT
                m.id AS mentorId,
                u.name AS mentorName,
                m.job AS mentorJob,
                u.imageUrl AS mentorImageUrl
            FROM
                mentor m
            JOIN
                users u ON m.userId = u.id
            JOIN
                course c ON m.id = c.mentorId
            WHERE
                c.pathFocusId = ?
            GROUP BY
                m.id, u.name, m.job, u.imageUrl;
        `,
      [pathFocusId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No mentors found for the given pathFocusId" });
    }

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCourseDetails = async (req, res) => {
  const { courseId } = req.params;
  try {
    const [rows] = await pool.query(
      `
            SELECT
                c.id AS courseId,
                c.name AS courseName,
                (
                    SELECT JSON_ARRAYAGG(JSON_OBJECT('id', s.id, 'name', s.name))
                    FROM courseSkills cs
                    JOIN skills s ON cs.skillId = s.id
                    WHERE cs.courseId = c.id
                ) AS skills,
                c.method AS method,
                c.description AS description,
                (
                    SELECT COUNT(*)
                    FROM material
                    WHERE courseId = c.id
                ) AS totalMaterial,
                c.price AS price
            FROM
                course c
            WHERE
                c.id = ?;
        `,
      [courseId]
    );

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No course found for the given courseId" });
    }

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMentorDetailsByCourseId = async (req, res) => {
  const { courseId } = req.params;  

  try {
    const [mentor] = await pool.query(
      `
        SELECT 
        u.id AS mentorId,
        u.name AS mentorName,
        u.email AS mentorEmail,
        u.phoneNumber AS mentorPhoneNumber,
        u.universities AS mentorUniversities,
        u.imageUrl AS mentorImageUrl,
        u.point AS mentorPoint,
        u.role AS mentorRole,
        m.job AS mentorJob
    FROM 
        users u
    JOIN 
        mentor m ON u.id = m.userId
    JOIN 
        course c ON m.id = c.mentorId
    WHERE 
        c.id = ?
        `,
      [courseId]
    );

    if (mentor.length === 0) {
      return res
        .status(404)
        .json({ message: "No mentor found for the given mentorId" });
    }

    res.json(mentor[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const checkTestForRole = async (req, res) => {
  const { roleId } = req.params;
  const userId = req.user.userId;

  try {
    const [rows] = await pool.query(
      `
            SELECT 
                r.id AS roleId,
                r.name AS roleName,
                t.id AS testId,
                t.name AS testName,
                IFNULL(ut.status, 'false') AS userTestStatus
            FROM 
                role r
            JOIN 
                test t ON r.testId = t.id
            LEFT JOIN 
                userTests ut ON t.id = ut.testId AND ut.userId = ?
            WHERE 
                r.id = ?
        `,
      [userId, roleId]
    );

    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTestDetails = async (req, res) => {
  const { testId } = req.params;
  try {
    const [rows] = await pool.query(
      `
            SELECT 
                t.id AS testId,
                t.name AS testName,
                t.description AS testDescription,
                t.duration AS testDuration,
                (
                    SELECT COUNT(*)
                    FROM testQuestion q
                    WHERE q.testId = t.id
                ) AS totalQuestion,
                JSON_ARRAYAGG(
                    JSON_OBJECT('id', s.id, 'name', s.name)
                ) AS skills
            FROM 
                test t
            LEFT JOIN 
                testQuestion q ON t.id = q.testId
            LEFT JOIN 
                testSkills ts ON t.id = ts.testId
            LEFT JOIN 
                skills s ON ts.skillId = s.id
            WHERE 
                t.id = ?
            GROUP BY 
                t.id
        `,
      [testId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Test not found" });
    }

    const uniqueData = rows.map(item => ({
      ...item,
      skills: [...new Set(item.skills.map(skill => JSON.stringify(skill)))]
        .map(skill => JSON.parse(skill))
    }));

    res.json(uniqueData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTestQuestions = async (req, res) => {
  const { testId } = req.params;
  try {
    const [rows] = await pool.query(
      `
            SELECT 
                t.id AS testId,
                t.duration AS testDuration,
                (
                    SELECT COUNT(*)
                    FROM testQuestion q
                    WHERE q.testId = t.id
                ) AS totalQuestion,
                q.id AS questionId,
                q.question AS questionText,
                a.id AS answerId,
                a.answer AS answerText,
                a.isCorrect AS isCorrect
            FROM 
                test t
            LEFT JOIN 
                testQuestion q ON t.id = q.testId
            LEFT JOIN 
                testAnswer a ON q.id = a.questionId
            WHERE 
                t.id = ?
        `,
      [testId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Test not found" });
    }

    const questionsMap = {};
    rows.forEach((row) => {
      if (!questionsMap[row.questionId]) {
        questionsMap[row.questionId] = {
          idQuestion: row.questionId,
          question: row.questionText,
          answers: [],
          correctAnswer: row.isCorrect === 1 ? row.answerId : null,
        };
      }
      questionsMap[row.questionId].answers.push({
        idAnswer: row.answerId,
        answer: row.answerText,
      });
    });

    const questions = Object.values(questionsMap);

    const testDetails = {
      id: rows[0].testId,
      duration: rows[0].testDuration,
      totalQuestion: rows[0].totalQuestion,
      questions: questions,
    };

    res.json(testDetails);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const saveTest = async (req, res) => {
  const userId = req.user.userId;
  const testId = req.params.testId;
  const { score, correctAnswer, wrongAnswer } = req.body;

  try {

    const [userTest] = await pool.query(`
        INSERT INTO userTests (userId, testId, correctAnswers, wrongAnswers, totalScore, status, timestamp)
        VALUES (?, ?, ?, ?, ?, 'COMPLETED', NOW())
      `, [userId, testId, correctAnswer, wrongAnswer, score]);

    res.json({ message: "Test saved successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDataLanding,
  getRoleById,
  getPathById,
  getCoursesByPathFocusId,
  getMentorsByPathFocusId,
  getCourseDetails,
  getMentorDetailsByCourseId,
  checkTestForRole,
  getTestDetails,
  getTestQuestions,
  saveTest
};
