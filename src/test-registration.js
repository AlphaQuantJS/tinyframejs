// Тестирование регистрации методов
import { DataFrame } from './core/dataframe/DataFrame.js';
import { Series } from './core/dataframe/Series.js';
import { extendClasses } from './methods/autoExtend.js';

// Создаем тестовый DataFrame
const df = new DataFrame({
  a: [1, 2, 3],
  b: [4, 5, 6],
});

// Проверяем, зарегистрированы ли методы
console.log('Методы DataFrame:');
console.log('- melt:', typeof df.melt === 'function');
console.log('- pivot:', typeof df.pivot === 'function');
console.log('- sum:', typeof df.sum === 'function');
console.log('- filter:', typeof df.filter === 'function');

// Явно вызываем функцию регистрации методов
console.log('\nРегистрируем методы явно...');
extendClasses({ DataFrame, Series });

// Проверяем еще раз
console.log('\nМетоды DataFrame после явной регистрации:');
console.log('- melt:', typeof df.melt === 'function');
console.log('- pivot:', typeof df.pivot === 'function');
console.log('- sum:', typeof df.sum === 'function');
console.log('- filter:', typeof df.filter === 'function');
