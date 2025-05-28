/**
 * Скрипт для обновления путей импорта в тестах
 *
 * Этот скрипт обновляет пути импорта в тестах, чтобы они соответствовали
 * новой структуре модуля src/methods.
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
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

// Функция для обновления путей импорта в файле
function updateImports(filePath) {
  // Проверяем, что это файл теста JavaScript
  if (!filePath.endsWith('.test.js')) return;

  console.log(`Обновление импортов в файле: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');

  // Обновляем пути импорта
  content = content.replace(
    /from ['"]\.\.\/\.\.\/\.\.\/src\/core\/DataFrame\.js['"]/g,
    'from \'../../../../src/core/DataFrame.js\'',
  );

  content = content.replace(
    /from ['"]\.\.\/\.\.\/\.\.\/src\/core\/Series\.js['"]/g,
    'from \'../../../../src/core/Series.js\'',
  );

  // Обновляем пути импорта для методов
  content = content.replace(
    /from ['"]\.\.\/\.\.\/\.\.\/src\/methods\/aggregation\/([^'"]+)['"]/g,
    'from \'../../../../src/methods/dataframe/aggregation/$1\'',
  );

  content = content.replace(
    /from ['"]\.\.\/\.\.\/\.\.\/src\/methods\/filtering\/([^'"]+)['"]/g,
    'from \'../../../../src/methods/dataframe/filtering/$1\'',
  );

  content = content.replace(
    /from ['"]\.\.\/\.\.\/\.\.\/src\/methods\/transform\/([^'"]+)['"]/g,
    'from \'../../../../src/methods/dataframe/transform/$1\'',
  );

  content = content.replace(
    /from ['"]\.\.\/\.\.\/\.\.\/src\/methods\/timeseries\/([^'"]+)['"]/g,
    'from \'../../../../src/methods/dataframe/timeseries/$1\'',
  );

  content = content.replace(
    /from ['"]\.\.\/\.\.\/\.\.\/src\/methods\/display\/([^'"]+)['"]/g,
    'from \'../../../../src/methods/dataframe/display/$1\'',
  );

  // Записываем обновленное содержимое обратно в файл
  fs.writeFileSync(filePath, content, 'utf8');
}

// Функция для запуска обновления путей импорта
async function main() {
  // Обновляем пути импорта в тестах
  const testDir = path.join(__dirname, 'test', 'methods');
  walkDir(testDir, updateImports);

  console.log('Обновление путей импорта завершено!');
}

// Запускаем скрипт
main().catch((error) => {
  console.error('Ошибка при обновлении путей импорта:', error);
  process.exit(1);
});
