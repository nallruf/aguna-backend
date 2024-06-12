CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(20) UNIQUE,
  email VARCHAR(100) UNIQUE,
  password VARCHAR(100),
  name VARCHAR(100),
  phoneNumber VARCHAR(13),
  universities VARCHAR(100) NULL,
  imageUrl VARCHAR(100) NULL,
  point INT DEFAULT 0,
  role ENUM('USER', 'ADMIN', 'MENTOR') DEFAULT 'USER'
);

CREATE TABLE password_resets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  token VARCHAR(255) UNIQUE,
  expires_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE test (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  description VARCHAR(300),
  duration INT
);

CREATE TABLE role (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  description VARCHAR(300),
  testId INT,
  FOREIGN KEY (testId) REFERENCES test(id) ON DELETE CASCADE
);

CREATE TABLE bank (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  No VARCHAR(100),
  imageUrl VARCHAR(100),
  tag ENUM('AGUNA', 'MENTOR')
);

CREATE TABLE mentor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  job VARCHAR(100),
  bankId INT,
  userId INT UNIQUE,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (bankId) REFERENCES bank(id)
);

CREATE TABLE skills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100)
);

CREATE TABLE tools (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  description VARCHAR(100),
  imageUrl VARCHAR(100)
);

CREATE TABLE userSkills (
  userId INT,
  skillId INT,
  PRIMARY KEY (userId, skillId),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (skillId) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE path (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  imageUrl VARCHAR(100),
  description VARCHAR(300),
  roleId INT,
  FOREIGN KEY (roleId) REFERENCES role(id)
);

CREATE TABLE pathFocus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pathId INT,
  name VARCHAR(100),
  description VARCHAR(300),
  imageUrl VARCHAR(100),
  FOREIGN KEY (pathId) REFERENCES path(id)
);

CREATE TABLE course (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pathFocusId INT,
  imageUrl VARCHAR(100),
  name VARCHAR(100),
  description VARCHAR(300),
  price FLOAT,
  level ENUM('BEGINNER', 'INTERMEDIATE', 'ADVANCE'),
  mentorId INT,
  FOREIGN KEY (pathFocusId) REFERENCES pathFocus(id),
  FOREIGN KEY (mentorId) REFERENCES mentor(id)
);

CREATE TABLE courseSkills (
  courseId INT,
  skillId INT,
  PRIMARY KEY (courseId, skillId),
  FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE,
  FOREIGN KEY (skillId) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE courseTools (
  courseId INT,
  toolId INT,
  PRIMARY KEY (courseId, toolId),
  FOREIGN KEY (courseId) REFERENCES course(id) ON DELETE CASCADE,
  FOREIGN KEY (toolId) REFERENCES tools(id) ON DELETE CASCADE
);

CREATE TABLE material (
  id INT AUTO_INCREMENT PRIMARY KEY,
  courseId INT,
  name VARCHAR(100),
  video VARCHAR(100) NULL,
  materi VARCHAR(100) NULL,
  FOREIGN KEY (courseId) REFERENCES course(id)
);

CREATE TABLE promo (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(8),
  percent INT
);


CREATE TABLE testSkills (
  testId INT,
  skillId INT,
  PRIMARY KEY (testId, skillId),
  FOREIGN KEY (testId) REFERENCES test(id) ON DELETE CASCADE,
  FOREIGN KEY (skillId) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE testQuestion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  testId INT,
  question VARCHAR(100),
  score INT,
  FOREIGN KEY (testId) REFERENCES test(id)
);

CREATE TABLE testAnswer (
  id INT AUTO_INCREMENT PRIMARY KEY,
  questionId INT,
  answer VARCHAR(100),
  isCorrect BOOLEAN,
  FOREIGN KEY (questionId) REFERENCES testQuestion(id)
);

CREATE TABLE challenge (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100),
  imageUrl VARCHAR(100),
  description VARCHAR(300),
  start DATETIME,
  end DATETIME,
  winnerId INT
);

CREATE TABLE challengeSkills (
  challengeId INT,
  skillId INT,
  PRIMARY KEY (challengeId, skillId),
  FOREIGN KEY (challengeId) REFERENCES challenge(id) ON DELETE CASCADE,
  FOREIGN KEY (skillId) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE submission (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  challengeId INT,
  link VARCHAR(100),
  score INT DEFAULT 0,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (challengeId) REFERENCES challenge(id)
);

CREATE TABLE speakers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  jobs VARCHAR(100),
  imageUrl VARCHAR(100)
);

CREATE TABLE event (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100),
  description VARCHAR(100),
  date DATETIME,
  time VARCHAR(100),
  organizer VARCHAR(100),
  imageUrl VARCHAR(100),
  location VARCHAR(100),
  price FLOAT
);

CREATE TABLE eventSpeaker (
  speakerId INT,
  eventId INT,
  PRIMARY KEY (speakerId, eventId),
  FOREIGN KEY (speakerId) REFERENCES speakers(id) ON DELETE CASCADE,
  FOREIGN KEY (eventId) REFERENCES event(id) ON DELETE CASCADE
);


CREATE TABLE testimoni (
  id INT AUTO_INCREMENT PRIMARY KEY,
  courseId INT,
  userId INT,
  quotes VARCHAR(300),
  FOREIGN KEY (courseId) REFERENCES course(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);

  CREATE TABLE transaction (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATETIME,
    paymentDeadline DATETIME,
    type ENUM('COURSE', 'MENTORING', 'EVENT'),
    status ENUM('ACCEPT', 'REJECT', 'PENDING', 'UNPAID') DEFAULT 'UNPAID',
    courseId INT NULL,
    eventId INT NULL,
    userId INT,
    FOREIGN KEY (courseId) REFERENCES course(id),
    FOREIGN KEY (eventId) REFERENCES event(id),
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE detailTransaction (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transactionId INT UNIQUE,
    price FLOAT,
    serviceFee FLOAT,
    promoId INT,
    bankId INT,
    totalPrice FLOAT,
    imageUrl VARCHAR(100) NULL,
    FOREIGN KEY (transactionId) REFERENCES transaction(id),
    FOREIGN KEY (bankId) REFERENCES bank(id),
    FOREIGN KEY (promoId) REFERENCES promo(id)
  );


CREATE TABLE userCourse (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  courseId INT,
  enrollmentDate DATETIME,
  completionStatus ENUM('IN_PROGRESS', 'COMPLETED', 'DROPPED'),
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (courseId) REFERENCES course(id)
);

CREATE TABLE userCourseProgress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userCourseId INT,
  materialId INT,
  progressStatus BOOLEAN default false,
  FOREIGN KEY (userCourseId) REFERENCES userCourse(id),
  FOREIGN KEY (materialId) REFERENCES material(id)
);

CREATE TABLE certificate (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userCourseId INT,
  issueDate DATE,
  imageUrl VARCHAR(100),
  FOREIGN KEY (userCourseId) REFERENCES userCourse(id)
);

CREATE TABLE userTests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT,
  testId INT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  correctAnswers INT,
  wrongAnswers INT,
  totalScore INT,
  status ENUM('IN_PROGRESS', 'COMPLETED') DEFAULT 'IN_PROGRESS',
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (testId) REFERENCES test(id) ON DELETE CASCADE
);

CREATE TABLE faq (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question VARCHAR(100),
  answer VARCHAR(300)
);


CREATE TABLE eventSkills (
  eventId INT,
  skillId INT,
  PRIMARY KEY (eventId, skillId),
  FOREIGN KEY (eventId) REFERENCES event(id) ON DELETE CASCADE,
  FOREIGN KEY (skillId) REFERENCES skills(id) ON DELETE CASCADE
);

COMMIT
