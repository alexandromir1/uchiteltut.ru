import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Путь к Excel файлам
const excelDir = path.join(__dirname, '../../data/excel');

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

    console.log(`📊 Найдены заголовки в ${fileName}:`, headers);

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
        String(h).toLowerCase().includes('почт') ||
        String(h).toLowerCase().includes('email')
      ),
      salary: headers.findIndex(h =>
        String(h).toLowerCase().includes('зарплат') ||
        String(h).toLowerCase().includes('зп')
      ),
      duties: headers.findIndex(h =>
        String(h).toLowerCase().includes('обязанност')
      ),
      support: headers.findIndex(h =>
        String(h).toLowerCase().includes('поддержк') ||
        String(h).toLowerCase().includes('меры')
      ),
      studentEmployment: headers.findIndex(h =>
        String(h).toLowerCase().includes('студент') ||
        String(h).toLowerCase().includes('трудоустройств')
      ),
      openDate: headers.findIndex(h =>
        String(h).toLowerCase().includes('дата') ||
        String(h).toLowerCase().includes('открыти')
      )
    };

    console.log(`📍 Маппинг колонок для ${fileName}:`, columnMap);

    // Обрабатываем данные
    const jobs = [];

    for (let row = headerRowIndex + 1; row < jsonData.length; row++) {
      const rowData = jsonData[row] || [];

      // Извлекаем данные по маппингу
      const region = columnMap.region >= 0 ? String(rowData[columnMap.region] || "").trim() : "";
      const position = columnMap.position >= 0 ? String(rowData[columnMap.position] || "").trim() : "";
      const school = columnMap.school >= 0 ? String(rowData[columnMap.school] || "").trim() : "";

      // Пропускаем пустые строки (нет должности и школы)
      if (!position && !school) continue;

      // Если регион пустой, используем название файла
      const finalRegion = region || path.basename(fileName, '.xlsx').replace('.xlsx', '');

      const job = {
        id: `${fileName}-${row + 1}`,
        region: finalRegion,
        position: position || "Должность не указана",
        school: school || "Школа не указана",
        hours: columnMap.hours >= 0 ? String(rowData[columnMap.hours] || "").trim() : "",
        housing: columnMap.housing >= 0 ? String(rowData[columnMap.housing] || "").trim() : "",
        benefits: columnMap.benefits >= 0 ? String(rowData[columnMap.benefits] || "").trim() : "",
        contacts: columnMap.contacts >= 0 ? String(rowData[columnMap.contacts] || "").trim() : "",
        email: columnMap.email >= 0 ? String(rowData[columnMap.email] || "").trim() : "",
        salary: columnMap.salary >= 0 ? String(rowData[columnMap.salary] || "").trim() : "",
        duties: columnMap.duties >= 0 ? String(rowData[columnMap.duties] || "").trim() : "",
        support: columnMap.support >= 0 ? String(rowData[columnMap.support] || "").trim() : "",
        studentEmployment: columnMap.studentEmployment >= 0 ? String(rowData[columnMap.studentEmployment] || "").trim() : "",
        openDate: columnMap.openDate >= 0 ? normalizeDate(rowData[columnMap.openDate]) : new Date().toISOString().split('T')[0]
      };

      // Очищаем пустые значения
      Object.keys(job).forEach(key => {
        if (job[key] === "" || job[key] === "undefined" || job[key] === "null") {
          job[key] = "";
        }
      });

      jobs.push(job);
    }

    console.log(`✅ ${fileName} — обработано ${jobs.length} вакансий с листа "ОО"`);

    // Логируем первые 2 вакансии для отладки
    if (jobs.length > 0) {
      console.log(`📋 Примеры вакансий из ${fileName}:`);
      jobs.slice(0, 2).forEach((job, index) => {
        console.log(`  ${index + 1}. ${job.position} - ${job.school}`);
      });
    }

    return jobs;

  } catch (error) {
    console.error(`❌ Ошибка чтения файла ${fileName}:`, error.message);
    return [];
  }
}

// Функция нормализации даты
function normalizeDate(dateValue) {
  if (!dateValue) return new Date().toISOString().split('T')[0];

  try {
    // Если это объект Date
    if (dateValue instanceof Date) {
      return dateValue.toISOString().split('T')[0];
    }

    // Если это строка
    const str = String(dateValue).trim();
    if (str) {
      // Пробуем разные форматы дат
      const date = new Date(str);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }

      // Если это Excel дата в числовом формате
      if (!isNaN(parseFloat(str))) {
        const excelDate = new Date((parseFloat(str) - 25569) * 86400 * 1000);
        return excelDate.toISOString().split('T')[0];
      }

      return str;
    }

    return new Date().toISOString().split('T')[0];
  } catch (error) {
    console.log('⚠️ Ошибка нормализации даты:', dateValue, error.message);
    return new Date().toISOString().split('T')[0];
  }
}

// Основная функция для получения всех вакансий
function getJobs() {
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
      return getTestData();
    }

    const files = fs.readdirSync(excelDir).filter(f => f.endsWith(".xlsx"));
    console.log(`📁 Найдено ${files.length} Excel файлов:`, files);

    let allJobs = [];

    // Обрабатываем каждый файл
    for (const file of files) {
      const filePath = path.join(excelDir, file);
      const jobs = parseOOSheet(filePath, file);
      allJobs = allJobs.concat(jobs);
    }

    console.log(`🎉 ИТОГО: Загружено ${allJobs.length} вакансий из ${files.length} файлов`);

    // Сохраняем для отладки
    if (allJobs.length > 0) {
      const debugPath = path.join(__dirname, '../jobs-debug.json');
      fs.writeFileSync(debugPath, JSON.stringify(allJobs.slice(0, 5), null, 2));
      console.log(`📝 Пример данных сохранен: ${debugPath}`);
    }

    return allJobs;

  } catch (error) {
    console.error('❌ Критическая ошибка в getJobs:', error);
    return getTestData();
  }
}

// Тестовые данные на случай ошибки
function getTestData() {
  console.log('⚠️ Используем тестовые данные');
  return [
    {
      id: "test-1",
      region: "Абыйский",
      position: "физическая культура",
      school: "МБОУ 'Уолбутская СОШ им. С.Ф. Маркова'",
      hours: "18ч+ВУД",
      housing: "Комната в общежитие специалистов",
      benefits: "Единовременная выплата молодым педагогам",
      contacts: "84115923368, 89659956539",
      email: "uososch@mail.ru",
      salary: "от 50 тыс.руб до 70тыс.руб",
      duties: "планирование и введение урочных планов, формирование и воспитание школьных умений и навыков на физическую подготовку.",
      support: "оплата проезда",
      studentEmployment: "да",
      openDate: "2025-04-01"
    },
    {
      id: "test-2",
      region: "Абыйский",
      position: "физика",
      school: "МБОУ 'Мугурдахская СОШ им. В.Н. Дохунаева'",
      hours: "18+ВУД",
      housing: "ч/б квартира",
      benefits: "Единовременная выплата молодым педагогам",
      contacts: "89644188394",
      email: "mug_ssh_abiy@bk.ru",
      salary: "от 65 тыс.руб до 80тыс.руб",
      duties: "планирование и введение урочных планов, формирование и воспитание школьных умений и навыков",
      support: "региональная программа 'Учитель Арктики'",
      studentEmployment: "",
      openDate: "2025-04-01"
    }
  ];
}

export { getJobs };