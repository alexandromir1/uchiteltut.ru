import { getJobs } from './excelLoader.js';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const importExcelData = async () => {
  console.log('🚀 Начинаем импорт данных из Excel...');
  
  try {
    // Открываем базу данных
    const db = await open({
      filename: path.join(__dirname, 'database.db'),
      driver: sqlite3.Database
    });

    // Получаем данные из Excel
    const excelJobs = getJobs();
    console.log(`📊 Найдено ${excelJobs.length} вакансий в Excel файлах`);

    // Очищаем старые данные (опционально)
    await db.run('DELETE FROM jobs WHERE school_id = 0');
    console.log('✅ Старые тестовые данные удалены');

    // Импортируем данные из Excel
    let importedCount = 0;
    
    for (const job of excelJobs) {
      try {
        await db.run(
          `INSERT INTO jobs (
            school_id, position, school, region, hours, salary, housing, benefits,
            contacts, email, support, student_employment, duties, open_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            0, // school_id = 0 для импортированных данных
            job.position,
            job.school,
            job.region,
            job.hours,
            job.salary,
            job.housing,
            job.benefits,
            job.contacts,
            job.email,
            job.support,
            job.studentEmployment,
            job.duties,
            job.openDate || new Date().toISOString()
          ]
        );
        importedCount++;
      } catch (error) {
        console.log(`⚠️ Ошибка импорта вакансии ${job.id}:`, error.message);
      }
    }

    console.log(`🎉 Импорт завершен! Успешно импортировано ${importedCount} вакансий`);
    
    // Показываем статистику
    const stats = await db.all(`
      SELECT 
        COUNT(*) as total_jobs,
        COUNT(DISTINCT region) as regions,
        COUNT(DISTINCT position) as positions
      FROM jobs
    `);
    
    console.log('📈 Статистика базы данных:');
    console.log(`   Всего вакансий: ${stats[0].total_jobs}`);
    console.log(`   Регионов: ${stats[0].regions}`);
    console.log(`   Должностей: ${stats[0].positions}`);
    
    await db.close();
    
  } catch (error) {
    console.error('❌ Ошибка импорта:', error);
  }
};

// Запускаем импорт
importExcelData();