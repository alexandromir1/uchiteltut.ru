import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к Excel файлам
let excelDir = path.join(__dirname, '../../data/excel');

// Функция для чтения данных с листа "ОО"
function parseOOSheet(filePath, fileName) {
  try {
    console.log(`📖 Чтение файла: ${fileName}`);

    const workbook = XLSX.readFile(filePath, {
      cellDates: true,
      cellText: false,
      cellNF: false
    });

    // Проверяем наличие листа "ОО"
    if (!workbook.SheetNames.includes('ОО')) {
      console.log(`❌ Лист "ОО" не найден в файле ${fileName}`);
      return [];
    }

    const sheet = workbook.Sheets['ОО'];

    if (!sheet || !sheet['!ref']) {
      console.log(`❌ Пустой лист "ОО" в файле ${fileName}`);
      return [];
    }

    // Конвертируем в JSON с заголовками
    const jsonData = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      raw: false
    });

    if (jsonData.length <= 2) {
      console.log(`❌ Недостаточно данных в листе "ОО" файла ${fileName}`);
      return [];
    }

    // Ищем строку с заголовками (обычно строка 2)
    let headerRowIndex = -1;
    let headers = [];

    for (let row = 0; row < Math.min(jsonData.length, 10); row++) {
      const rowData = jsonData[row] || [];
      const rowString = rowData.map(cell => String(cell).toLowerCase()).join(' ');

      // Ищем ключевые заголовки
      const hasMunicipal = rowString.includes('муниципальный') || rowString.includes('район');
      const hasPosition = rowString.includes('должность');
      const hasSchool = rowString.includes('образовательная') || rowString.includes('организация');

      if (hasMunicipal && hasPosition && hasSchool) {
        headerRowIndex = row;
        headers = rowData.map(h => String(h).trim());
        break;
      }
    }

    if (headerRowIndex === -1) {
      console.log(`❌ Заголовки не найдены в файле ${fileName}`);
      return [];
    }

    // Создаем маппинг колонок
    const columnMap = {
      region: headers.findIndex(h =>
        String(h).toLowerCase().includes('муниципальный') ||
        String(h).toLowerCase().includes('район')
      ),
      position: headers.findIndex(h =>
        String(h).toLowerCase().includes('должность')
      ),
      school: headers.findIndex(h =>
        String(h).toLowerCase().includes('образовательная') ||
        String(h).toLowerCase().includes('организация')
      ),
      hours: headers.findIndex(h =>
        String(h).toLowerCase().includes('нагрузка') ||
        String(h).toLowerCase().includes('час')
      ),
      housing: headers.findIndex(h =>
        String(h).toLowerCase().includes('жилье') ||
        String(h).toLowerCase().includes('общежитие')
      ),
      benefits: headers.findIndex(h =>
        String(h).toLowerCase().includes('льгот')
      ),
      contacts: headers.findIndex(h =>
        String(h).toLowerCase().includes('контакт') ||
        String(h).toLowerCase().includes('телефон')
      ),
      email: headers.findIndex(h =>
        String(h).toLowerCase().includes('email') ||
        String(h).toLowerCase().includes('почт')
      ),
      support: headers.findIndex(h =>
        String(h).toLowerCase().includes('поддержк') ||
        String(h).toLowerCase().includes('меры')
      ),
      studentEmployment: headers.findIndex(h =>
        String(h).toLowerCase().includes('студент') ||
        String(h).toLowerCase().includes('старш')
      ),
      duties: headers.findIndex(h =>
        String(h).toLowerCase().includes('обязанност') ||
        String(h).toLowerCase().includes('функц')
      ),
      salary: headers.findIndex(h =>
        String(h).toLowerCase().includes('зарплат') ||
        String(h).toLowerCase().includes('оклад')
      ),
      openDate: headers.findIndex(h =>
        String(h).toLowerCase().includes('дата') ||
        String(h).toLowerCase().includes('открыт')
      )
    };

    const jobs = [];

    // Обрабатываем строки данных
    for (let row = headerRowIndex + 1; row < jsonData.length; row++) {
      const rowData = jsonData[row] || [];
      
      const position = columnMap.position >= 0 ? String(rowData[columnMap.position] || '').trim() : '';
      const school = columnMap.school >= 0 ? String(rowData[columnMap.school] || '').trim() : '';
      
      // Пропускаем пустые строки
      if (!position && !school) continue;

      const region = columnMap.region >= 0 ? String(rowData[columnMap.region] || '').trim() : '';
      
      // Извлекаем регион из названия файла, если не найден в данных
      let finalRegion = region;
      if (!finalRegion) {
        const regionMatch = fileName.match(/^(.+?)\.xlsx$/);
        if (regionMatch) {
          finalRegion = regionMatch[1].replace(/[_\s]+/g, ' ');
        }
      }

      const job = {
        position,
        school,
        region: finalRegion,
        hours: columnMap.hours >= 0 ? String(rowData[columnMap.hours] || '').trim() || null : null,
        salary: columnMap.salary >= 0 ? String(rowData[columnMap.salary] || '').trim() || null : null,
        housing: columnMap.housing >= 0 ? String(rowData[columnMap.housing] || '').trim() || null : null,
        benefits: columnMap.benefits >= 0 ? String(rowData[columnMap.benefits] || '').trim() || null : null,
        contacts: columnMap.contacts >= 0 ? String(rowData[columnMap.contacts] || '').trim() || null : null,
        email: columnMap.email >= 0 ? String(rowData[columnMap.email] || '').trim() || null : null,
        support: columnMap.support >= 0 ? String(rowData[columnMap.support] || '').trim() || null : null,
        studentEmployment: columnMap.studentEmployment >= 0 ? String(rowData[columnMap.studentEmployment] || '').trim() || null : null,
        duties: columnMap.duties >= 0 ? String(rowData[columnMap.duties] || '').trim() || null : null,
        openDate: columnMap.openDate >= 0 ? normalizeDate(rowData[columnMap.openDate]) : null
      };

      // Очищаем пустые строки
      Object.keys(job).forEach(key => {
        if (job[key] === '' || job[key] === 'undefined' || job[key] === 'null') {
          job[key] = null;
        }
      });

      jobs.push(job);
    }

    return jobs;
  } catch (error) {
    console.error(`❌ Ошибка при чтении файла ${fileName}:`, error.message);
    return [];
  }
}

function normalizeDate(dateValue) {
  if (!dateValue) return null;
  
  try {
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0];
    }
    
    const dateStr = String(dateValue);
    if (!dateStr || dateStr === 'undefined' || dateStr === 'null') {
      return null;
    }

    // Пробуем разные форматы
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Основная функция для получения всех вакансий
export function getJobs() {
  console.log('🔍 Поиск Excel файлов в:', excelDir);

  try {
    if (!fs.existsSync(excelDir)) {
      console.error("❌ Папка с Excel не найдена:", excelDir);
      
      // Альтернативные пути
      const possiblePaths = [
        './data/excel',
        '../data/excel',
        '../../data/excel',
        path.join(process.cwd(), 'data/excel'),
        path.join(__dirname, '../../../data/excel')
      ];

      for (const possiblePath of possiblePaths) {
        const fullPath = path.resolve(possiblePath);
        if (fs.existsSync(fullPath)) {
          console.log(`✅ Найдена папка: ${fullPath}`);
          excelDir = fullPath;
          break;
        }
      }
    }

    if (!fs.existsSync(excelDir)) {
      console.error("❌ Папка с Excel не найдена после поиска");
      return [];
    }

    const files = fs.readdirSync(excelDir).filter(f => f.endsWith(".xlsx"));
    console.log(`📁 Найдено ${files.length} Excel файлов`);

    let allJobs = [];

    // Обрабатываем каждый файл
    for (const file of files) {
      const filePath = path.join(excelDir, file);
      const jobs = parseOOSheet(filePath, file);
      allJobs = allJobs.concat(jobs);
    }

    console.log(`🎉 ИТОГО: Загружено ${allJobs.length} вакансий из ${files.length} файлов`);

    return allJobs;

  } catch (error) {
    console.error('❌ Критическая ошибка в getJobs:', error);
    return [];
  }
}

