-- Schema cho hệ thống quản lý học sinh
-- Tạo database nếu chưa tồn tại
CREATE DATABASE IF NOT EXISTS quanlyhocsinh CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quanlyhocsinh;

SET FOREIGN_KEY_CHECKS = 0;

-- Xóa bảng nếu tồn tại (để tạo lại sạch)
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS user_accounts;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS reward_disciplines;
DROP TABLE IF EXISTS scores;
DROP TABLE IF EXISTS assessments;
DROP TABLE IF EXISTS attendances;
DROP TABLE IF EXISTS class_sessions;
DROP TABLE IF EXISTS teaching_assignments;
DROP TABLE IF EXISTS student_classes;
DROP TABLE IF EXISTS class_rooms;
DROP TABLE IF EXISTS parents;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS subjects;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS semesters;
DROP TABLE IF EXISTS school_years;

SET FOREIGN_KEY_CHECKS = 1;

-- Năm học
CREATE TABLE school_years (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Học kỳ
CREATE TABLE semesters (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  code VARCHAR(20) NOT NULL,
  school_year_id VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  FOREIGN KEY (school_year_id) REFERENCES school_years(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Khối lớp
CREATE TABLE grades (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  code VARCHAR(20) NOT NULL,
  level INT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Môn học
CREATE TABLE subjects (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  grade_id VARCHAR(50) NOT NULL,
  is_elective TINYINT(1) DEFAULT 0,
  description TEXT,
  FOREIGN KEY (grade_id) REFERENCES grades(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Giáo viên
CREATE TABLE teachers (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  gender ENUM('MALE','FEMALE') NOT NULL,
  date_of_birth DATE,
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  subject_ids JSON,
  hire_date DATE,
  status ENUM('ACTIVE','RESIGNED') DEFAULT 'ACTIVE'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Học sinh
CREATE TABLE students (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  gender ENUM('MALE','FEMALE') NOT NULL,
  date_of_birth DATE,
  place_of_birth VARCHAR(100),
  ethnicity VARCHAR(50),
  religion VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  enrollment_date DATE,
  status ENUM('STUDYING','GRADUATED','TRANSFERRED','SUSPENDED') DEFAULT 'STUDYING',
  avatar_color VARCHAR(20)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Phụ huynh
CREATE TABLE parents (
  id VARCHAR(50) PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  gender ENUM('MALE','FEMALE') NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  occupation VARCHAR(100),
  student_id VARCHAR(50) NOT NULL,
  relation VARCHAR(20),
  FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Lớp học
CREATE TABLE class_rooms (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) NOT NULL,
  grade_id VARCHAR(50) NOT NULL,
  school_year_id VARCHAR(50) NOT NULL,
  homeroom_teacher_id VARCHAR(50),
  max_students INT DEFAULT 40,
  FOREIGN KEY (grade_id) REFERENCES grades(id),
  FOREIGN KEY (school_year_id) REFERENCES school_years(id),
  FOREIGN KEY (homeroom_teacher_id) REFERENCES teachers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Phân lớp học sinh
CREATE TABLE student_classes (
  id VARCHAR(100) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  class_id VARCHAR(50) NOT NULL,
  school_year_id VARCHAR(50) NOT NULL,
  roll_number INT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (class_id) REFERENCES class_rooms(id),
  FOREIGN KEY (school_year_id) REFERENCES school_years(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Phân công giảng dạy
CREATE TABLE teaching_assignments (
  id VARCHAR(50) PRIMARY KEY,
  teacher_id VARCHAR(50) NOT NULL,
  subject_id VARCHAR(50) NOT NULL,
  class_id VARCHAR(50) NOT NULL,
  semester_id VARCHAR(50) NOT NULL,
  school_year_id VARCHAR(50) NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (class_id) REFERENCES class_rooms(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id),
  FOREIGN KEY (school_year_id) REFERENCES school_years(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Buổi học
CREATE TABLE class_sessions (
  id VARCHAR(50) PRIMARY KEY,
  class_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  period INT NOT NULL,
  subject_id VARCHAR(50) NOT NULL,
  teacher_id VARCHAR(50) NOT NULL,
  note TEXT,
  FOREIGN KEY (class_id) REFERENCES class_rooms(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Điểm danh
CREATE TABLE attendances (
  id VARCHAR(50) PRIMARY KEY,
  session_id VARCHAR(50) NOT NULL,
  student_id VARCHAR(50) NOT NULL,
  status ENUM('CO_MAT','VANG_PHEP','VANG_KHONG_PHEP','DI_MUON') NOT NULL,
  note TEXT,
  FOREIGN KEY (session_id) REFERENCES class_sessions(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Đợt đánh giá
CREATE TABLE assessments (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  subject_id VARCHAR(50) NOT NULL,
  class_id VARCHAR(50) NOT NULL,
  semester_id VARCHAR(50) NOT NULL,
  score_type ENUM('TX','GK','CK') NOT NULL,
  coefficient INT NOT NULL DEFAULT 1,
  school_year_id VARCHAR(50) NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (class_id) REFERENCES class_rooms(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id),
  FOREIGN KEY (school_year_id) REFERENCES school_years(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Điểm số
CREATE TABLE scores (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  assessment_id VARCHAR(50) NOT NULL,
  subject_id VARCHAR(50) NOT NULL,
  class_id VARCHAR(50) NOT NULL,
  semester_id VARCHAR(50) NOT NULL,
  school_year_id VARCHAR(50) NOT NULL,
  score_type ENUM('TX','GK','CK') NOT NULL,
  value DECIMAL(4,2) NOT NULL,
  coefficient INT NOT NULL DEFAULT 1,
  comment TEXT,
  is_locked TINYINT(1) DEFAULT 0,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (assessment_id) REFERENCES assessments(id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id),
  FOREIGN KEY (class_id) REFERENCES class_rooms(id),
  FOREIGN KEY (semester_id) REFERENCES semesters(id),
  FOREIGN KEY (school_year_id) REFERENCES school_years(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Khen thưởng / kỷ luật
CREATE TABLE reward_disciplines (
  id VARCHAR(50) PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  type ENUM('REWARD','DISCIPLINE') NOT NULL,
  title VARCHAR(200) NOT NULL,
  reason TEXT,
  date DATE NOT NULL,
  decision_number VARCHAR(50) NOT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Vai trò hệ thống
CREATE TABLE roles (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  label VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSON,
  is_system TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tài khoản người dùng
CREATE TABLE user_accounts (
  id VARCHAR(50) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  role ENUM('ADMIN','TEACHER','STUDENT','PARENT') NOT NULL,
  role_id VARCHAR(50),
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  last_login VARCHAR(50),
  avatar_color VARCHAR(20),
  teacher_id VARCHAR(50),
  student_id VARCHAR(50),
  FOREIGN KEY (role_id) REFERENCES roles(id),
  FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  FOREIGN KEY (student_id) REFERENCES students(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Thông báo
CREATE TABLE notifications (
  id VARCHAR(50) PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  time VARCHAR(50),
  type ENUM('info','success','warning') DEFAULT 'info'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
