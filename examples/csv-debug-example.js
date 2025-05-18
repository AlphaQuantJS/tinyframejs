/**
 * Пример для отладки чтения CSV-файлов с разными типами данных
 */

import { readCsv } from '../src/io/readers/csv.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем текущую директорию для корректной работы с путями
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Создаем тестовые данные напрямую в коде
const homogeneousData =
  'date,open,high,low,close,volume\n' +
  '2023-01-01,100.5,105.75,99.25,103.5,1000000\n' +
  '2023-01-02,103.75,108.25,102.5,107.25,1500000\n' +
  '2023-01-03,107.5,110.0,106.25,109.75,1200000\n' +
  '2023-01-04,109.5,112.75,108.0,112.0,1400000\n' +
  '2023-01-05,112.25,115.5,111.0,115.0,1600000';

const polymorphicData =
  'id,name,value,mixed\n' +
  '1,"John Doe",100.5,true\n' +
  '2,"Jane Smith",200.75,123\n' +
  '3,"Bob Johnson",300.25,"text"\n' +
  '4,"Alice Brown",400.0,2023-01-01\n' +
  '5,"Charlie Wilson",500.5,null';

// Вспомогательная функция для отображения типов данных
function logDataTypes(df, title) {
  console.log(`\n=== ${title} ===`);
  console.log(
    `Размер DataFrame: ${df.rowCount} строк × ${df.columns.length} колонок`,
  );
  console.log('Колонки:', df.columns);

  // Получаем данные в виде массива объектов
  const data = df.toArray();

  // Выводим первую строку и типы данных
  if (data.length > 0) {
    console.log('\nПервая строка:');
    const firstRow = data[0];

    for (const key in firstRow) {
      const value = firstRow[key];
      console.log(
        `  ${key}: ${value} (${typeof value}${value instanceof Date ? ' [Date]' : ''})`,
      );
    }

    // Проверяем, есть ли колонка с полиморфными данными
    if (df.columns.includes('mixed')) {
      console.log('\nЗначения в колонке "mixed":');
      data.forEach((row, index) => {
        console.log(
          `  Строка ${index + 1}: ${row.mixed} (${typeof row.mixed}${row.mixed instanceof Date ? ' [Date]' : ''})`,
        );
      });
    }
  }

  // Выводим DataFrame в табличном виде
  console.log('\nТаблица данных:');
  df.print();
}

async function main() {
  try {
    // 1. Загрузка однотипных данных (числовые значения)
    console.log('Загрузка однотипных данных из строки');

    const homogeneousDF = await readCsv(homogeneousData, {
      dynamicTyping: true, // Автоматическое определение типов
      header: true, // Первая строка - заголовки
    });

    logDataTypes(homogeneousDF, 'Однотипные данные');

    // 2. Загрузка полиморфных данных (разные типы в одной колонке)
    console.log('\nЗагрузка полиморфных данных из строки');

    const polymorphicDF = await readCsv(polymorphicData, {
      dynamicTyping: true, // Автоматическое определение типов
      header: true, // Первая строка - заголовки
    });

    logDataTypes(polymorphicDF, 'Полиморфные данные');

    // 3. Тестирование прямого преобразования строк в различные типы
    console.log('\n=== Тестирование преобразования типов ===');
    const testValues = ['true', 'false', '123', '45.67', '2023-01-01', 'text'];

    console.log('Прямое преобразование строк:');
    for (const value of testValues) {
      // Имитируем логику из convertType
      let convertedValue;

      if (value.toLowerCase() === 'true') convertedValue = true;
      else if (value.toLowerCase() === 'false') convertedValue = false;
      else if (!isNaN(value) && value.trim() !== '') {
        const intValue = parseInt(value, 10);
        convertedValue =
          intValue.toString() === value ? intValue : parseFloat(value);
      } else if (
        /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/.test(value)
      ) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
          convertedValue = date;
        } else {
          convertedValue = value;
        }
      } else convertedValue = value;

      console.log(
        `  '${value}' -> ${convertedValue} (${typeof convertedValue}${convertedValue instanceof Date ? ' [Date]' : ''})`,
      );
    }
  } catch (error) {
    console.error('Ошибка при выполнении примера:', error);
  }
}

main();
