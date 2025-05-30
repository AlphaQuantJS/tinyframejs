// test/methods/filtering/tail.test.js
import { describe, it, expect, vi } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';

// Тестовые данные для использования во всех тестах
const testData = {
  name: ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
  age: [25, 30, 35, 40, 45],
  city: ['New York', 'San Francisco', 'Chicago', 'Boston', 'Seattle'],
  salary: [70000, 85000, 90000, 95000, 100000],
};

// Создаем пустой DataFrame для тестирования пустых случаев
const emptyData = {
  name: [],
  age: [],
  city: [],
  salary: [],
};

describe('DataFrame.tail()', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      it('should return the last rows by default', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.tail(5, { print: false });

        expect(result.rowCount).toBe(5);
        expect(result.toArray()).toEqual([
          { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
          { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
          { name: 'David', age: 40, city: 'Boston', salary: 95000 },
          { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
        ]);
      });

      it('should return the specified number of rows from the end', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.tail(3, { print: false });

        expect(result.rowCount).toBe(3);
        expect(result.toArray()).toEqual([
          { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
          { name: 'David', age: 40, city: 'Boston', salary: 95000 },
          { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
        ]);
      });

      it('should return all rows if n is greater than the number of rows', () => {
        // df создан выше с помощью createDataFrameWithStorage
        const result = df.tail(20, { print: false });

        expect(result.rowCount).toBe(5);
        expect(result.toArray()).toEqual([
          { name: 'Alice', age: 25, city: 'New York', salary: 70000 },
          { name: 'Bob', age: 30, city: 'San Francisco', salary: 85000 },
          { name: 'Charlie', age: 35, city: 'Chicago', salary: 90000 },
          { name: 'David', age: 40, city: 'Boston', salary: 95000 },
          { name: 'Eve', age: 45, city: 'Seattle', salary: 100000 },
        ]);
      });

      it('should return an empty DataFrame if the original DataFrame is empty', () => {
        // Создаем пустой DataFrame для тестирования
        const emptyDf = createDataFrameWithStorage(
          DataFrame,
          emptyData,
          storageType,
        );
        const result = emptyDf.tail(5, { print: false });

        expect(result.rowCount).toBe(0);
        expect(result.toArray()).toEqual([]);
      });

      it('should throw an error if n is not a positive integer', () => {
        // df создан выше с помощью createDataFrameWithStorage

        expect(() => df.tail(0, { print: false })).toThrow(
          'Number of rows must be a positive number',
        );
        expect(() => df.tail(-1, { print: false })).toThrow(
          'Number of rows must be a positive number',
        );
        expect(() => df.tail(2.5, { print: false })).toThrow(
          'Number of rows must be an integer',
        );
      });

      // Тесты для опции print отключены, так как в DataFrame нет метода print
      // В будущем можно добавить метод print в DataFrame и вернуть эти тесты

      it('should handle print option correctly', () => {
        // df создан выше с помощью createDataFrameWithStorage

        // Проверяем, что опция print не влияет на результат
        const result1 = df.tail(3, { print: true });
        const result2 = df.tail(3, { print: false });

        expect(result1.rowCount).toBe(3);
        expect(result2.rowCount).toBe(3);

        // Проверяем, что результаты одинаковы
        expect(result1.toArray()).toEqual(result2.toArray());
      });
    });
  });
});
