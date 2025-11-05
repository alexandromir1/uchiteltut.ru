import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { getJobs } from './src/excelLoader.js';

const app = express();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'teacher-portal-secret-key-2024';
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-vercel-app.vercel.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE']
}));
app.use(express.json());

// 📝 РЕГИСТРАЦИЯ
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name, role, school_name, district, phone } = req.body;
    console.log('📝 Регистрация:', email, name, role);

    // Проверяем существующего пользователя
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя и профиль в транзакции
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role
        }
      });

      if (role === 'school') {
        await tx.school.create({
          data: {
            userId: user.id,
            schoolName: school_name,
            district,
            phone
          }
        });
      } else if (role === 'teacher') {
        await tx.teacher.create({
          data: {
            userId: user.id,
            fullName: name,
            contactEmail: email,
            contactPhone: phone
          }
        });
      }

      return user;
    });

    const token = jwt.sign({ 
      userId: result.id, 
      email: result.email, 
      role: result.role 
    }, JWT_SECRET);

    res.json({
      success: true,
      token,
      user: { 
        id: result.id, 
        email: result.email, 
        role: result.role, 
        name: result.name 
      }
    });

    console.log('✅ Пользователь зарегистрирован:', email);

  } catch (error) {
    console.error('❌ Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка регистрации' });
  }
});

// 🔐 ВХОД
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🔐 Вход:', email);

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(400).json({ error: 'Пользователь не найден' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Неверный пароль' });
    }

    const token = jwt.sign({ 
      userId: user.id, 
      email: user.email, 
      role: user.role 
    }, JWT_SECRET);

    res.json({
      success: true,
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role, 
        name: user.name 
      }
    });

    console.log('✅ Успешный вход:', email);

  } catch (error) {
    console.error('❌ Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка входа' });
  }
});

// 📋 ВАКАНСИИ
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { isActive: true },
      orderBy: [
        { schoolId: 'desc' }, // Сначала пользовательские вакансии
        { createdAt: 'desc' }
      ]
    });
    
    console.log(`📊 Отправляем ${jobs.length} вакансий`);
    res.json({ success: true, jobs });
    
  } catch (error) {
    console.error('❌ Ошибка загрузки вакансий:', error);
    res.status(500).json({ error: 'Ошибка загрузки вакансий' });
  }
});

// ➕ ДОБАВЛЕНИЕ ВАКАНСИИ
app.post('/api/jobs', async (req, res) => {
  try {
    const { 
      position, school, region, hours, salary, housing, benefits, 
      contacts, email, support, student_employment, duties, school_id 
    } = req.body;
    
    const job = await prisma.job.create({
      data: {
        schoolId: school_id,
        position,
        school,
        region,
        hours,
        salary,
        housing,
        benefits,
        contacts,
        email,
        support,
        studentEmployment: student_employment,
        duties
      }
    });
    
    console.log('✅ Новая вакансия добавлена:', position);
    res.json({ success: true, jobId: job.id });
    
  } catch (error) {
    console.error('❌ Ошибка добавления вакансии:', error);
    res.status(500).json({ error: 'Ошибка добавления вакансии' });
  }
});

// 🔄 ИМПОРТ ДАННЫХ ИЗ EXCEL
app.post('/admin/import-excel', async (req, res) => {
  try {
    console.log('🔄 Импорт данных из Excel...');
    const excelJobs = getJobs();
    
    let importedCount = 0;
    
    for (const excelJob of excelJobs) {
      try {
        await prisma.job.create({
          data: {
            // schoolId: null для импортированных данных
            position: excelJob.position,
            school: excelJob.school,
            region: excelJob.region,
            hours: excelJob.hours,
            salary: excelJob.salary,
            housing: excelJob.housing,
            benefits: excelJob.benefits,
            contacts: excelJob.contacts,
            email: excelJob.email,
            support: excelJob.support,
            studentEmployment: excelJob.studentEmployment,
            duties: excelJob.duties,
            openDate: excelJob.openDate
          }
        });
        importedCount++;
      } catch (error) {
        console.log(`⚠️ Ошибка импорта: ${excelJob.position}`, error.message);
      }
    }
    
    console.log(`✅ Импортировано ${importedCount} вакансий из Excel`);
    res.json({ 
      success: true, 
      message: `Импортировано ${importedCount} вакансий из Excel` 
    });
    
  } catch (error) {
    console.error('❌ Ошибка импорта Excel:', error);
    res.status(500).json({ error: 'Ошибка импорта данных' });
  }
});

// 🏥 ПРОВЕРКА СЕРВЕРА И БАЗЫ
app.get('/health', async (req, res) => {
  try {
    // Проверяем подключение к базе
    await prisma.$queryRaw`SELECT 1`;
    
    const stats = await prisma.job.count();
    
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      jobsCount: stats,
      timestamp: new Date().toLocaleString('ru-RU')
    });
    
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Disconnected',
      error: error.message 
    });
  }
});

// 🚀 ЗАПУСК СЕРВЕРА
app.listen(PORT, async () => {
  console.log('🎉 СЕРВЕР ЗАПУЩЕН!');
  console.log(`📍 Порт: ${PORT}`);
  console.log(`🌐 Адрес: http://localhost:${PORT}`);
  console.log(`🏥 Проверка: http://localhost:${PORT}/health`);
  console.log('✅ Готов к работе!');
});