import 'dotenv/config';
import { prisma } from '../lib/prisma.js';
import { getJobs } from '../lib/excelLoader.js';

async function importExcelData() {
  console.log('🚀 Начинаем импорт данных из Excel...');
  
  try {
    // Получаем данные из Excel
    const excelJobs = getJobs();
    console.log(`📊 Найдено ${excelJobs.length} вакансий в Excel файлах`);

    if (excelJobs.length === 0) {
      console.log('❌ Нет данных для импорта');
      await prisma.$disconnect();
      return;
    }

    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    
    // Импортируем данные из Excel
    for (const job of excelJobs) {
      try {
        // Проверяем, не существует ли уже такая вакансия
        const existing = await prisma.job.findFirst({
          where: {
            position: job.position,
            school: job.school,
            region: job.region || null,
          },
        });

        if (existing) {
          skippedCount++;
          continue;
        }

        await prisma.job.create({
          data: {
            position: job.position,
            school: job.school,
            region: job.region || null,
            hours: job.hours || null,
            salary: job.salary || null,
            housing: job.housing || null,
            benefits: job.benefits || null,
            contacts: job.contacts || null,
            email: job.email || null,
            support: job.support || null,
            studentEmployment: job.studentEmployment || null,
            duties: job.duties || null,
            openDate: job.openDate || null,
            isActive: true,
          },
        });
        importedCount++;
        
        if (importedCount % 50 === 0) {
          console.log(`  📝 Импортировано ${importedCount} вакансий...`);
        }
      } catch (error) {
        console.error(`⚠️ Ошибка импорта вакансии "${job.position}" в "${job.school}":`, error.message);
        errorCount++;
      }
    }

    console.log('\n✅ Импорт завершен!');
    console.log(`   Импортировано: ${importedCount}`);
    console.log(`   Пропущено (дубликаты): ${skippedCount}`);
    console.log(`   Ошибок: ${errorCount}`);
    
    // Показываем статистику
    const stats = await prisma.job.aggregate({
      _count: {
        id: true,
      },
    });
    
    const regions = await prisma.job.groupBy({
      by: ['region'],
      _count: {
        region: true,
      },
    });
    
    console.log('\n📈 Статистика базы данных:');
    console.log(`   Всего вакансий: ${stats._count.id}`);
    console.log(`   Регионов: ${regions.length}`);
    
  } catch (error) {
    console.error('❌ Ошибка импорта:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Запускаем импорт
importExcelData();

