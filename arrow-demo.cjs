/**
 * Демонстрация интеграции Apache Arrow с TinyFrameJS
 * Этот скрипт показывает, как Apache Arrow используется в TinyFrameJS
 * для оптимизации хранения данных
 */

// Импортируем Apache Arrow
const Arrow = require('apache-arrow');

// Создаем простую функцию для создания Arrow вектора
function createArrowVector(data) {
  // Определяем тип данных на основе первого элемента
  const firstItem = data.find((x) => x !== null && x !== undefined);
  const type = typeof firstItem;

  if (type === 'string') {
    return Arrow.vectorFromArray(data);
  } else if (type === 'number') {
    return Arrow.vectorFromArray(data, new Arrow.Float64());
  } else if (type === 'boolean') {
    return Arrow.vectorFromArray(data, new Arrow.Bool());
  } else {
    return Arrow.vectorFromArray(data.map((x) => String(x)));
  }
}

// Создаем простую обертку для Arrow вектора
class ArrowVector {
  constructor(vector) {
    this._vector = vector;
    this.isArrow = true;
  }

  get(index) {
    return this._vector.get(index);
  }

  toArray() {
    return this._vector.toArray();
  }

  get length() {
    return this._vector.length;
  }
}

// Создаем простую обертку для TypedArray
class TypedArrayVector {
  constructor(array) {
    this._array = array;
    this.isTypedArray = true;
  }

  get(index) {
    return this._array[index];
  }

  toArray() {
    return Array.from(this._array);
  }

  get length() {
    return this._array.length;
  }
}

// Создаем простую фабрику для создания векторов
const VectorFactory = {
  from(data, options = {}) {
    // Проверяем, нужно ли использовать Arrow
    const useArrow =
      options.preferArrow ||
      options.alwaysArrow ||
      typeof data[0] === 'string' ||
      data.length > 1000000;

    if (useArrow) {
      try {
        // Пробуем создать Arrow вектор
        const arrowVector = createArrowVector(data);
        return new ArrowVector(arrowVector);
      } catch (error) {
        console.error('Error creating Arrow vector:', error);
      }
    }

    // Если не удалось создать Arrow вектор или не нужно его использовать,
    // создаем TypedArray вектор для числовых данных
    if (data.every((x) => typeof x === 'number')) {
      return new TypedArrayVector(Float64Array.from(data));
    }

    // В остальных случаях возвращаем обычный массив
    return {
      _array: Array.from(data),
      get: (index) => data[index],
      toArray: () => Array.from(data),
      length: data.length,
    };
  },
};

// Демонстрация использования Arrow для разных типов данных
console.log('=== Демонстрация Apache Arrow в TinyFrameJS ===');

// 1. Строковые данные - должны использовать Arrow
console.log('\n1. Строковые данные:');
const stringData = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
const stringVector = VectorFactory.from(stringData);
console.log('Тип вектора:', stringVector.constructor.name);
console.log('Использует Arrow:', !!stringVector.isArrow);
console.log('Данные:', stringVector.toArray());

// 2. Числовые данные - должны использовать TypedArray
console.log('\n2. Числовые данные:');
const numericData = [1, 2, 3, 4, 5];
const numericVector = VectorFactory.from(numericData);
console.log('Тип вектора:', numericVector.constructor.name);
console.log('Использует TypedArray:', !!numericVector.isTypedArray);
console.log('Данные:', numericVector.toArray());

// 3. Принудительное использование Arrow для числовых данных
console.log('\n3. Числовые данные с preferArrow:');
const preferArrowVector = VectorFactory.from(numericData, {
  preferArrow: true,
});
console.log('Тип вектора:', preferArrowVector.constructor.name);
console.log('Использует Arrow:', !!preferArrowVector.isArrow);
console.log('Данные:', preferArrowVector.toArray());

// 4. Данные с null значениями
console.log('\n4. Данные с null значениями:');
const nullData = ['apple', null, 'cherry', undefined, 'elderberry'];
const nullVector = VectorFactory.from(nullData);
console.log('Тип вектора:', nullVector.constructor.name);
console.log('Использует Arrow:', !!nullVector.isArrow);
console.log('Данные:', nullVector.toArray());

// 5. Большой массив данных
console.log('\n5. Большой массив данных:');
const largeData = Array.from({ length: 1000 }, (_, i) => i);
const largeVector = VectorFactory.from(largeData, { preferArrow: true });
console.log('Тип вектора:', largeVector.constructor.name);
console.log('Использует Arrow:', !!largeVector.isArrow);
console.log('Длина:', largeVector.length);
console.log('Первые 5 элементов:', largeVector.toArray().slice(0, 5));
console.log('Последние 5 элементов:', largeVector.toArray().slice(-5));

console.log('\n=== Демонстрация завершена ===');
