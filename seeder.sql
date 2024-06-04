-- Seeder for users table
INSERT INTO users (username, email, password, name, phoneNumber, universities, imageUrl, point, role) VALUES
    ('Nabila', 'nabila@aguna.com', 'password123', 'John Doe', '123456789', 'University A', 'nabila.jpg', 100, 'MENTOR'),
    ('Yuda', 'yuda@aguna.com', 'password456', 'Jane Smith', '987654321', 'University B', 'yuda.jpg', 50, 'MENTOR'),
    ('Taufik', 'taufik@aguna.com', 'password789', 'Adam Jones', '555666777', 'University C', 'taufik.jpg', 75, 'MENTOR'),
    ('Zainal', 'zainal@aguna.com', 'password123', 'Zainal Abidin', '123456789', 'University A', 'zainal.jpg', 100, 'USER'),
    ('Ulum', 'ulum@aguna.com', 'password456', 'Ulum', '987654321', 'University B', 'ulum.jpg', 50, 'USER'),
    ('Nasrul', 'nasrul@aguna.com', 'password789', 'Nasrul', '555666777', 'University C', 'nasrul.jpg', 75, 'USER');


-- Seeder for password_resets table
INSERT INTO password_resets (user_id, token, expires_at) VALUES
    (1, 'token123', '2024-05-25 12:00:00'),
    (2, 'token456', '2024-05-26 12:00:00');

-- Seeder for test table
INSERT INTO test (name, description, duration) VALUES
    ('Technical Test', 'Technical assessment for IT skills', 60),
    ('Business Test', 'Business assessment for IT roles', 45),
    ('Hipster Knowledge Test', 'Test your knowledge about trendy technologies and design principles.', 60);

-- Seeder for role table
INSERT INTO role (name, description, testId) VALUES
    ('HACKER', 'Skilled in technical aspects of IT', 1),
    ('HUSTLER', 'Expert in business development', 2),
    ('HIPSTER', 'Creative and design-oriented', 3);

-- Seeder for bank table
INSERT INTO bank (name, No, imageUrl, tag) VALUES
    ('Bank A', '1234567890', 'bank1.jpg', 'AGUNA'),
    ('Bank B', '0987654321', 'bank2.jpg', 'AGUNA'),
    ('Bank C', '1357924680', 'bank3.jpg', 'AGUNA'),
    ('Bank D', '2468135790', 'bank4.jpg', 'MENTOR'),
    ('Bank E', '9876543210', 'bank5.jpg', 'MENTOR'),
    ('Bank F', '0123456789', 'bank6.jpg', 'MENTOR');


-- Seeder for mentor table
INSERT INTO mentor (job, bankId, userId) VALUES
    ('Mobile Developer', 4, 3),
    ('Web Developer', 5, 1),
    ('Business Consultant', 6, 2);

-- Seeder for skills table
INSERT INTO skills (name) VALUES
    ('HTML'),
    ('CSS'),
    ('JavaScript'),
    ('Java'),
    ('Swift'),
    ('Python'),
    ('React'),
    ('Node.js'),
    ('UI/UX Design'),
    ('Business Strategy'),
    ('Data Analysis');

-- Seeder for tools table
INSERT INTO tools (name, description, imageUrl) VALUES
    ('Visual Studio Code', 'Code editor', 'vscode_image.jpg'),
    ('Android Studio', 'IDE for Android development', 'android_studio_image.jpg'),
    ('Figma', 'UI/UX design tool', 'figma_image.jpg');

-- Seeder for userSkills table
INSERT INTO userSkills (userId, skillId) VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (2, 4),
    (3, 5),
    (3, 6);

-- Seeder for path table
INSERT INTO path (name, imageUrl, description, roleId) VALUES
    ('Web Development', 'web_path.jpg','Learn to develop web applications.', 1),
    ('Mobile Development', 'mobile_path.jpg','Learn to develop mobile applications.', 1),
    ('Business Development', 'bussiness_path.jpg','Learn business strategies in IT.', 2),
    ('Data Science', 'data_path.jpg','Explore data analysis and machine learning techniques.', 3),
    ('Cybersecurity', 'cyber_path.jpg','Learn to secure digital systems and networks.', 1),
    ('UI/UX Design', 'uiux_path.jpg','Master the principles of user interface and user experience design.', 3),
    ('Pemula', 'hacker_path.jpg','Intro to hacker.', 1),
    ('Pemula', 'hustler_path.jpg','Intro to hustler.', 2),
    ('Pemula', 'hipster_path.jpg','Intro to hipster.', 3);
    

-- Seeder for pathFocus table
INSERT INTO pathFocus (pathId, imageUrl,name, description) VALUES
    (1, "frontend_pf.jpg",'Frontend', 'Focus on client-side development.'),
    (1, "backend_pf.jpg" ,'Backend', 'Focus on server-side development.'),
    (2, "android_pf.jpg",'Android', 'Focus on Android app development.'),
    (2, "ios_pf.jpg",'iOS', 'Focus on iOS app development.'),
    (3, "startup_pf.jpg",'Startup Fundamentals', 'Learn how to start and grow a tech startup.'),
    (4, "dataanalys_pf.jpg",'Data Analysis', 'Analyze and interpret data to solve business problems.'),
    (4, "ml_pf.jpg",'Machine Learning', 'Explore algorithms and models for predictive analysis.'),
    (5, "netsec_pf.jpg",'Network Security', 'Protect digital networks from unauthorized access.'),
    (5, "hacking_pf.jpg",'Ethical Hacking', 'Learn ethical hacking techniques to identify system vulnerabilities.'),
    (6, "ui_pf.jpg",'UI Design', 'Design intuitive and visually appealing user interfaces.'),
    (6, "ux_pf.jpg",'UX Research', 'Conduct user research to improve user experience.'),
    (7, "intro_hacker_pf.jpg","Intro Hacker", "Intro hacker"),
    (8, "intro_hustler_pf.jpg","Intro Hustler", "Intro hustler"),
    (9, "intro_hipster_pf.jpg","Intro Hipster", "Intro hipster");


-- Seeder for course table
INSERT INTO course (pathFocusId, imageUrl, name, description, price, level, mentorId) VALUES
    (1, 'webdev_course.jpg', 'Web Development Bootcamp', 'Intensive course covering HTML, CSS, and JavaScript for web development.', 99.99, 'BEGINNER', 2),
    (1, 'responsive_design.jpg', 'Responsive Web Design', 'Learn how to create responsive and user-friendly websites using modern CSS techniques.', 79.99, 'INTERMEDIATE', 2),
    (2, 'android_course.jpg', 'Android App Development', 'Build native Android apps using Java and Android Studio.', 129.99, 'BEGINNER', 1),
    (2, 'ios_course.jpg', 'iOS App Development with Swift', 'Develop iOS apps with Swift programming language and Xcode IDE.', 139.99, 'BEGINNER', 1),
    (3, 'startup_course.jpg', 'Startup Launchpad', 'Essential course for aspiring entrepreneurs to launch successful tech startups.', 149.99, 'BEGINNER', 3),
    (4, 'data_analysis.jpg', 'Data Analysis Fundamentals', 'Introduction to data analysis techniques using Python and libraries like Pandas and NumPy.', 89.99, 'BEGINNER', 3),
    (4, 'ml_course.jpg', 'Machine Learning Basics', 'Learn the basics of machine learning and implement algorithms for data analysis.', 119.99, 'INTERMEDIATE', 3),
    (5, 'network_security_course.jpg', 'Network Security Fundamentals', 'Understand the principles of network security and common cyber threats.', 109.99, 'BEGINNER', 2),
    (5, 'ethical_hacking_course.jpg', 'Ethical Hacking Techniques', 'Explore ethical hacking methodologies and techniques to secure digital systems.', 129.99, 'INTERMEDIATE', 2),
    (6, 'ui_design_course.jpg', 'UI Design Essentials', 'Master the fundamentals of UI design including layout, typography, and color theory.', 69.99, 'BEGINNER', 3),
    (6, 'ux_research_course.jpg', 'UX Research Methods', 'Learn various UX research methods to gather insights and improve user experience.', 79.99, 'INTERMEDIATE', 3),
    (7, 'intro_hacker_course.jpg', 'Computational thinking', 'Computional Thinking', 0, 'BEGINNER', 3),
    (8, 'intro_hustler_course.jpg', 'Team management', 'Team management', 0, 'BEGINNER', 3),
    (9, 'intro_hipster_course.jpg', 'How to be Creative', 'How to be Creative', 0, 'BEGINNER', 3);

-- Seeder for courseSkills table
INSERT INTO courseSkills (courseId, skillId) VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (2, 2),
    (2, 3),
    (2, 9),
    (3, 4),
    (3, 9),
    (4, 4),
    (4, 5),
    (5, 5),
    (5, 6),
    (6, 9),
    (7, 4),
    (7, 5),
    (7, 6),
    (8, 5),
    (8, 6),
    (8, 10),
    (9, 9),
    (9, 10),
    (10, 10),
    (10, 11),
    (11, 10),
    (12, 8);

-- Seeder for courseTools table
INSERT INTO courseTools (courseId, toolId) VALUES
    (1, 1),
    (2, 1),
    (2, 2),
    (3, 2),
    (3, 3),
    (4, 3),
    (5, 2),
    (6, 2),
    (7, 2),
    (8, 1),
    (9, 1),
    (10, 1),
    (11, 2),
    (12, 3);

-- Seeder for material table
INSERT INTO material (courseId, name, video, materi) VALUES
    (1, 'HTML Basics', 'html_basics.mp4', 'HTML Basics slides'),
    (1, 'CSS Styling', 'css_styling.mp4', 'CSS Styling slides'),
    (2, 'Responsive Design Principles', 'responsive_design_principles.mp4', 'Responsive Design slides'),
    (3, 'Android App Development Introduction', 'android_intro.mp4', 'Android App Development slides'),
    (3, 'Java Programming Basics', 'java_basics.mp4', 'Java Programming slides'),
    (4, 'iOS App Development Environment Setup', 'ios_setup.mp4', 'iOS App Development slides'),
    (4, 'Swift Language Fundamentals', 'swift_basics.mp4', 'Swift Language slides'),
    (5, 'Startup Planning and Strategy', 'startup_planning.mp4', 'Startup Planning slides'),
    (5, 'Business Model Canvas', 'business_model_canvas.mp4', 'Business Model slides'),
    (6, 'Data Analysis with Python', 'data_analysis_python.mp4', 'Data Analysis slides'),
    (6, 'Pandas Library Introduction', 'pandas_intro.mp4', 'Pandas slides'),
    (7, 'Machine Learning Concepts Overview', 'ml_concepts.mp4', 'Machine Learning slides'),
    (7, 'Supervised Learning Algorithms', 'supervised_learning.mp4', 'Supervised Learning slides'),
    (8, 'Network Security Fundamentals', 'network_security_basics.mp4', 'Network Security slides'),
    (8, 'Common Cyber Attacks', 'cyber_attacks.mp4', 'Cyber Attacks slides'),
    (9, 'Ethical Hacking Methodologies', 'ethical_hacking_methods.mp4', 'Ethical Hacking slides'),
    (9, 'Penetration Testing Techniques', 'penetration_testing.mp4', 'Penetration Testing slides'),
    (10, 'UI Design Principles', 'ui_design_principles.mp4', 'UI Design slides'),
    (10, 'Typography Essentials', 'typography_basics.mp4', 'Typography slides'),
    (11, 'UX Research Planning', 'ux_research_planning.mp4', 'UX Research slides'),
    (11, 'User Persona Development', 'user_persona.mp4', 'User Persona slides'),
    (12, 'Computational Thinking Concepts', 'comp_thinking_concepts.mp4', 'Computational Thinking slides'),
    (12, 'Problem Solving Strategies', 'problem_solving_strategies.mp4', 'Problem Solving slides'),
    (13, 'Team Management Principles', 'team_management_principles.mp4', 'Team Management slides'),
    (13, 'Effective Communication Skills', 'communication_skills.mp4', 'Communication Skills slides'),
    (14, 'Creative Thinking Techniques', 'creative_thinking.mp4', 'Creative Thinking slides');


-- Seeder for promo table
INSERT INTO promo (code, percent) VALUES
    ('PROMO123', 10),
    ('PROMO456', 20),
    ('PROMO789', 15);

-- Seeder for testSkills table
INSERT INTO testSkills (testId, skillId) VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (2, 4),
    (2, 9),
    (2, 10),
    (3, 1),
    (3, 2),
    (3, 3);

-- Seeder for testQuestion table
INSERT INTO testQuestion (testId, question, score) VALUES
    (1, 'What does HTML stand for?', 5),
    (1, 'What is the correct way to include external JavaScript file?', 10),
    (2, 'What is the difference between a leader and a manager?', 8),
    (2, 'What are the key components of a business model canvas?', 12),
    (3, 'What does UX stand for?', 5),
    (3, 'What is the primary role of a UX designer?', 10),
    (3, 'What is the importance of typography in web design?', 8);

-- Seeder for testAnswer table
INSERT INTO testAnswer (questionId, answer, isCorrect)VALUES
    (1, 'Hyper Text Markup Language', true),
    (1, 'Hyperlinks and Text Markup Language', false),
    (1, 'Home Tool Markup Language', false),
    (2, '<script src="script.js"></script>', true),
    (2, '<javascript src="script.js"></javascript>', false),
    (2, '<script href="script.js"></script>', false),
    (3, 'A leader inspires, motivates, and provides vision, while a manager focuses on....', true),
    (3, 'A leader focuses on tasks and plans, while a manager provides vision and motivates.', false),
    (3, 'A leader and a manager have the same roles and responsibilities.', false),
    (4, 'Customer Segments, Value Proposition, Channels, Customer Relationships.....', true),
    (4, 'Business Ideas, Sales Strategy, Marketing Plan', false),
    (4, 'Product Features, Pricing, Marketing Budget', false),
    (5, 'User Experience', true),
    (5, 'User Exploration', false),
    (5, 'User Exchange', false),
    (6, 'To create intuitive and engaging user interfaces.', true),
    (6, 'To write code for backend systems.', false),
    (6, 'To manage server infrastructure.', false),
    (7, 'Typography enhances readability and visual appeal.', true),
    (7, 'Typography has no impact on web design.', false),
    (7, 'Typography affects only print design.', false);

-- Seeder for challenge table
INSERT INTO challenge (title, imageUrl, description, start, end, winner) VALUES
    ('Web Development Challenge', 'webdev_challenge.jpg', 'Put your web development skills to the test with our coding challenge!', '2024-06-01', '2024-06-15', 2),
    ('Data Analysis Hackathon', 'hackathon_challenge.jpg', 'Analyze provided datasets and showcase your data analysis skills.', '2024-07-01', '2024-07-10', 3);

-- Seeder for challengeSkills table
INSERT INTO challengeSkills (challengeId, skillId) VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (2, 4),
    (2, 5);

-- Seeder for submission table
INSERT INTO submission (userId, challengeId, link, score) VALUES
    (1, 1, 'https://github.com/johndoe/webdev_challenge', 85),
    (2, 1, 'https://github.com/janesmith/webdev_challenge', 80),
    (1, 2, 'https://github.com/johndoe/data_analysis', 90);

-- Seeder for speakers table
INSERT INTO speakers (name, jobs, imageUrl) VALUES
    ('Michael Smith', 'Chief Technology Officer at TechCorp', 'speaker1.jpg'),
    ('Emily Johnson', 'Lead Data Scientist at Data Insights Inc.', 'speaker2.jpg');

-- Seeder for event table
INSERT INTO event (title, description, date, time, organizer, imageUrl, location, price) VALUES
    ('Tech Summit 2024', 'Join industry experts and innovators for a day of insights and networking.', '2024-08-15 09:00:00', '20.00 - 21.00','Tech Events LLC', 'event_techsummit.jpg', 'Convention Center A', 199.99),
    ('Data Science Conference', 'Explore the latest trends and advancements in data science and analytics.', '2024-09-20 10:00:00', "20.00 - 21.00",'Data Insights Inc.', 'event_datascience.jpg', 'Conference Hall B', 149.99);

-- Seeder for eventSpeaker table
INSERT INTO eventSpeaker (speakerId, eventId) VALUES
    (1, 1),
    (2, 2);

-- Seeder for testimoni table
INSERT INTO testimoni (courseId, userId, quotes) VALUES
    (1, 1, 'The web development bootcamp was fantastic! I learned so much in a short amount of time.'),
    (2, 2, 'Responsive web design course helped me improve my website layouts significantly.'),
    (3, 1, 'The Android app development course provided a solid foundation for building mobile apps.');

-- Seeder for transaction table
INSERT INTO transaction (date, paymentDeadline, type, status, courseId, userId) VALUES
    ('2024-06-01', '2024-06-07', 'COURSE', 'ACCEPT', 1, 4),
    ('2024-06-02', '2024-06-08', 'COURSE', 'ACCEPT', 4, 5),
    ('2024-06-03', '2024-06-09', 'COURSE', 'ACCEPT', 6, 6);

-- Seeder for detailTransaction table
INSERT INTO detailTransaction (transactionId, price, serviceFee, promoId, bankId, totalPrice, imageUrl) VALUES
    (1, 99.99, 5.00, NULL, 1, 104.99, 'transaction_image1.jpg'),
    (2, 79.99, 4.00, 1, 2, 79.99, NULL),
    (3, 149.99, 7.50, NULL, 3, 157.49, 'transaction_image2.jpg');

-- Seeder for userCourse table
INSERT INTO userCourse (userId, courseId, enrollmentDate, completionStatus) VALUES
    (4, 1, '2024-06-01', 'IN_PROGRESS'),
    (5, 4, '2024-06-02', 'IN_PROGRESS'),
    (6, 6, '2024-06-03', 'COMPLETED');

-- Seeder for userCourseProgress table
INSERT INTO userCourseProgress (userCourseId, materialId, progressStatus) VALUES
    (1, 1, true),
    (1, 2, true),
    (2, 3, true),
    (2, 4, true),
    (3, 5, true),
    (3, 6, true);

-- Seeder for certificate table
INSERT INTO certificate (userCourseId, issueDate, imageUrl) VALUES
    (3, '2024-06-30', 'certificate_image1.jpg'),
    (2, '2024-07-15', NULL),
    (1, '2024-07-30', 'certificate_image2.jpg');

-- Seeder for userTests table
INSERT INTO userTests (userId, testId, correctAnswers, wrongAnswers, totalScore) VALUES
    (4, 1, 20, 5, 75),
    (5, 1, 18, 7, 70),
    (6, 2, 15, 5, 60);

-- Seeder for faq table
INSERT INTO faq (question, answer) VALUES
    ('What is Aguna Edu?', 'Aguna Edu is an online learning platform that offers courses in various fields.'),
    ('How do I enroll in a course?', 'To enroll in a course, simply click on the course you want to take and follow the instructions to sign up.'),
    ('What types of courses are available?', 'Aguna Edu offers courses in web development, mobile development, data science, business development, and more.'),
    ('Are there any free courses available?', 'Yes, Aguna Edu offers a selection of free courses in addition to paid courses.'),
    ('How do I become a mentor?', 'To become a mentor, you can apply through the mentor application page and our team will review your credentials.'),
    ('What payment methods are accepted?', 'Aguna Edu accepts various payment methods including credit/debit cards, PayPal, and bank transfers.'),
    ('Can I get a refund if I am not satisfied with a course?', 'Yes, Aguna Edu offers a refund policy that allows you to request a refund within a certain period after enrolling in a course.'),
    ('How do I access my course materials?', 'Course materials can be accessed through your dashboard after you have enrolled in a course.'),
    ('Are there any prerequisites for courses?', 'Some courses may have prerequisites, which will be listed in the course description.'),
    ('How can I contact customer support?', 'You can contact customer support through the support page or by emailing support@agunaedu.com.');

INSERT INTO eventSkills (eventId, skillId) VALUES
    (1, 1),
    (1, 2),
    (1, 3),
    (2, 4),
    (2, 5);



COMMIT;
