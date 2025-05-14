// examples/head-tail-example.js

// Импортируем DataFrame из библиотеки
import { DataFrame } from '../src/core/DataFrame.js';

// Создаем тестовые данные
const testData = [
  { id: 1, name: 'Alice', age: 25, city: 'New York', salary: 75000 },
  { id: 2, name: 'Bob', age: 30, city: 'Boston', salary: 85000 },
  { id: 3, name: 'Charlie', age: 35, city: 'Chicago', salary: 92000 },
  { id: 4, name: 'David', age: 40, city: 'Denver', salary: 105000 },
  { id: 5, name: 'Eve', age: 45, city: 'Seattle', salary: 110000 },
  { id: 6, name: 'Frank', age: 50, city: 'San Francisco', salary: 125000 },
  { id: 7, name: 'Grace', age: 55, city: 'Los Angeles', salary: 130000 },
  { id: 8, name: 'Heidi', age: 60, city: 'Houston', salary: 95000 },
  { id: 9, name: 'Ivan', age: 65, city: 'Miami', salary: 88000 },
  { id: 10, name: 'Judy', age: 70, city: 'Atlanta', salary: 82000 },
];

// Создаем DataFrame
const df = DataFrame.create(testData);

console.log('=== Демонстрация методов head() и tail() ===');

// Пример 1: Использование head() без параметров (по умолчанию 5 строк)
console.log('\n1. Вызов head() без параметров (первые 5 строк):');
const head1 = df.head();
console.log(`Результат содержит ${head1.rowCount} строк`);

// Пример 2: Использование head() с указанием количества строк
console.log('\n2. Вызов head(3) (первые 3 строки):');
const head2 = df.head(3, { print: false });
console.log(`Результат содержит ${head2.rowCount} строк`);
console.log('Данные:');
console.log(head2.toArray());

// Пример 3: Использование tail() без параметров (по умолчанию 5 строк)
console.log('\n3. Вызов tail() без параметров (последние 5 строк):');
const tail1 = df.tail();
console.log(`Результат содержит ${tail1.rowCount} строк`);

// Пример 4: Использование tail() с указанием количества строк
console.log('\n4. Вызов tail(3) (последние 3 строки):');
const tail2 = df.tail(3, { print: false });
console.log(`Результат содержит ${tail2.rowCount} строк`);
console.log('Данные:');
console.log(tail2.toArray());

// Пример 5: Цепочка вызовов методов
console.log('\n5. Цепочка вызовов методов:');
console.log('Получаем первые 7 строк, затем последние 3 из них:');
const chained = df.head(7, { print: false }).tail(3, { print: false });
console.log(`Результат содержит ${chained.rowCount} строк`);
console.log('Данные:');
console.log(chained.toArray());

// Пример 6: Работа с пустым DataFrame
console.log('\n6. Работа с пустым DataFrame:');
const emptyDf = DataFrame.create([]);
const emptyHead = emptyDf.head(5, { print: false });
const emptyTail = emptyDf.tail(5, { print: false });
console.log(`head(): Результат содержит ${emptyHead.rowCount} строк`);
console.log(`tail(): Результат содержит ${emptyTail.rowCount} строк`);

console.log('\n=== Конец демонстрации ===');
