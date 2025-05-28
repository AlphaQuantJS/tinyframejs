/**
 * Скрипт для обновления тестов, чтобы они проверяли оба типа хранилища (TypedArray и Arrow)
 *
 * Этот скрипт модифицирует тесты в директории test/methods, чтобы они использовали
 * утилиты testWithBothStorageTypes и createDataFrameWithStorage для проверки
 * работы методов с обоими типами хранилища.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Получаем текущую директорию для ES модулей
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Функция для рекурсивного обхода директории
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else if (f.endsWith('.test.js')) {
      callback(path.join(dir, f));
    }
  });
}

// Функция для обновления тестов
function updateTests(filePath) {
  console.log(`Обновление тестов в файле: ${filePath}`);

  try {
    let content = fs.readFileSync(filePath, 'utf8');

    // Проверяем, содержит ли файл уже импорт утилит для тестирования хранилища
    if (content.includes('testWithBothStorageTypes')) {
      console.log(`  Файл уже обновлен, пропускаем: ${filePath}`);
      return;
    }

    // Добавляем импорт утилит для тестирования хранилища
    const importRegex = /(import\s+.*?from\s+['"].*?['"];?\s*)+/;
    const importMatch = content.match(importRegex);

    if (importMatch) {
      const importStatements = importMatch[0];
      const storageUtilsImport =
        'import { testWithBothStorageTypes, createDataFrameWithStorage } from \'../../../utils/storageTestUtils.js\';\n';

      // Определяем правильный путь к утилитам в зависимости от глубины вложенности файла
      const relativePath = path.relative(
        path.dirname(filePath),
        path.join(__dirname, 'test', 'utils'),
      );
      const normalizedPath = relativePath.replace(/\\/g, '/');
      const storageUtilsPath = normalizedPath + '/storageTestUtils.js';

      const updatedImport =
        importStatements +
        `import { testWithBothStorageTypes, createDataFrameWithStorage } from '${storageUtilsPath}';\n`;
      content = content.replace(importRegex, updatedImport);

      // Находим основной блок describe
      const describeRegex =
        /(describe\s*\(\s*['"].*?['"]\s*,\s*\(\s*\)\s*=>\s*\{)/;
      const describeMatch = content.match(describeRegex);

      if (describeMatch) {
        const describeStatement = describeMatch[1];

        // Добавляем тестовые данные и обертку testWithBothStorageTypes
        const testDataTemplate = `
// Тестовые данные для использования во всех тестах
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

`;

        const updatedDescribe =
          testDataTemplate +
          describeStatement +
          `
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(\`with \${storageType} storage\`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

`;

        content = content.replace(describeRegex, updatedDescribe);

        // Закрываем дополнительные блоки describe
        const lastClosingBrace = content.lastIndexOf('});');
        if (lastClosingBrace !== -1) {
          content = content.slice(0, lastClosingBrace) + '    });\n  });\n});';
        }

        // Записываем обновленное содержимое файла
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  Тесты успешно обновлены: ${filePath}`);
      } else {
        console.log(`  Не удалось найти блок describe в файле: ${filePath}`);
      }
    } else {
      console.log(`  Не удалось найти импорты в файле: ${filePath}`);
    }
  } catch (error) {
    console.error(`  Ошибка при обновлении тестов в файле ${filePath}:`, error);
  }
}

// Функция для запуска обновления тестов
async function main() {
  // Обновляем тесты в директории test/methods
  const testDir = path.join(__dirname, 'test', 'methods');
  walkDir(testDir, updateTests);

  console.log('Обновление тестов завершено!');
}

// Запускаем скрипт
main().catch((error) => {
  console.error('Ошибка при обновлении тестов:', error);
  process.exit(1);
});
