-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица школ
CREATE TABLE IF NOT EXISTS schools (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  school_name VARCHAR(255) NOT NULL,
  district VARCHAR(255),
  phone VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица учителей
CREATE TABLE IF NOT EXISTS teachers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  full_name VARCHAR(255) NOT NULL,
  specialization VARCHAR(255),
  subjects TEXT,
  experience INTEGER,
  education TEXT,
  qualification TEXT,
  skills TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица вакансий
CREATE TABLE IF NOT EXISTS jobs (
  id SERIAL PRIMARY KEY,
  school_id INTEGER REFERENCES users(id),
  position VARCHAR(255) NOT NULL,
  school VARCHAR(255) NOT NULL,
  region VARCHAR(255),
  hours VARCHAR(100),
  salary VARCHAR(100),
  housing TEXT,
  benefits TEXT,
  contacts TEXT,
  email VARCHAR(255),
  support TEXT,
  student_employment TEXT,
  duties TEXT,
  open_date VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);