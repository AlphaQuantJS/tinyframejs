import { describe, test, expect } from 'vitest';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';
import { cut } from '../../../../src/methods/dataframe/transform/cut.js';
import { validateColumn } from '../../../src/core/validators.js';

import {
  testWithBothStorageTypes,
  createDataFrameWithStorage,
} from '../../../utils/storageTestUtils.js';
/*
 * cut.test.js – basic and extended tests for the cut function
 * The semantics correspond to the "historical" behavior of TinyFrame/AlphaQuant,
 * which differs from pandas.
 */

// Тестовые данные для использования во всех тестах
const testData = [
  { value: 10, category: 'A', mixed: '20' },
  { value: 20, category: 'B', mixed: 30 },
  { value: 30, category: 'A', mixed: null },
  { value: 40, category: 'C', mixed: undefined },
  { value: 50, category: 'B', mixed: NaN },
];

describe('DataFrame.cut', () => {
  // Запускаем тесты с обоими типами хранилища
  testWithBothStorageTypes((storageType) => {
    describe(`with ${storageType} storage`, () => {
      // Создаем DataFrame с указанным типом хранилища
      const df = createDataFrameWithStorage(DataFrame, testData, storageType);

      // df создан выше с помощью createDataFrameWithStorage

      const cutWithDeps = cut({ validateColumn });

      /* ------------------------------------------------------------------ */
      test('creates a categorical column with default settings', () => {
        const resultFrame = cutWithDeps(df.frame, 'salary', {
          bins: [0, 50000, 80000, 150000],
          labels: ['Low', 'Medium', 'High'],
        });
        const result = new DataFrame(resultFrame);
        expect(result.frame.columns.salary_category).toEqual([
          null,
          null,
          'Medium',
          'Medium',
          'High',
          'High',
        ]);
      });

      test('uses custom name for new column', () => {
        const result = new DataFrame(
          cutWithDeps(df.frame, 'salary', {
            bins: [0, 50000, 80000, 150000],
            labels: ['Low', 'Medium', 'High'],
            columnName: 'salary_tier',
          }),
        );
        expect(result.frame.columns).toHaveProperty('salary_tier');
      });

      test('works with includeLowest=true', () => {
        const result = new DataFrame(
          cutWithDeps(df.frame, 'salary', {
            bins: [30000, 50000, 80000, 150000],
            labels: ['Low', 'Medium', 'High'],
            includeLowest: true,
          }),
        );
        expect(result.frame.columns.salary_category).toEqual([
          'Low',
          null,
          'Medium',
          'Medium',
          'High',
          'High',
        ]);
      });

      test('works with right=false', () => {
        const result = new DataFrame(
          cutWithDeps(df.frame, 'salary', {
            bins: [0, 50000, 80000, 100000],
            labels: ['Low', 'Medium', 'High'],
            right: false,
          }),
        );
        expect(result.frame.columns.salary_category).toEqual([
          'Low',
          'Low',
          'Medium',
          'Medium',
          'Medium',
          null,
        ]);
      });

      test('works with right=false and includeLowest=true', () => {
        const result = new DataFrame(
          cutWithDeps(df.frame, 'salary', {
            bins: [0, 50000, 80000, 100000],
            labels: ['Low', 'Medium', 'High'],
            right: false,
            includeLowest: true,
          }),
        );
        expect(result.frame.columns.salary_category).toEqual([
          'Low',
          'Low',
          'Medium',
          'Medium',
          'Medium',
          'High',
        ]);
      });

      test('handles null, undefined and NaN', () => {
        const dfNull = DataFrame.create({
          value: [10, null, 40, undefined, NaN, 60],
        });
        const result = new DataFrame(
          cutWithDeps(dfNull.frame, 'value', {
            bins: [0, 30, 50, 100],
            labels: ['Low', 'Medium', 'High'],
          }),
        );
        expect(result.frame.columns.value_category).toEqual([
          null,
          null,
          'Medium',
          null,
          null,
          'High',
        ]);
      });

      test('throws error with invalid arguments', () => {
        expect(() =>
          cutWithDeps(df.frame, 'salary', { bins: null, labels: ['A'] }),
        ).toThrow();
        expect(() =>
          cutWithDeps(df.frame, 'salary', { bins: [30], labels: [] }),
        ).toThrow();
        expect(() =>
          cutWithDeps(df.frame, 'salary', {
            bins: [0, 30, 100],
            labels: 'str',
          }),
        ).toThrow();
        expect(() =>
          cutWithDeps(df.frame, 'salary', {
            bins: [0, 30, 100],
            labels: ['A'],
          }),
        ).toThrow();
        expect(() =>
          cutWithDeps(df.frame, 'salary', {
            bins: [0, 30, 100],
            labels: ['A', 'B', 'C'],
          }),
        ).toThrow();
        expect(() =>
          cutWithDeps(df.frame, 'nonexistent', {
            bins: [0, 30, 100],
            labels: ['A', 'B'],
          }),
        ).toThrow();
      });

      /* -------------------------- Extended scenarios -------------------- */
      describe('DataFrame.cut – extended cases', () => {
        describe('interval boundaries', () => {
          const bins = [0, 10, 20];
          const labels = ['Low', 'High'];

          test('right=true, includeLowest=false – skip entire first interval', () => {
            const res = new DataFrame(
              cutWithDeps(
                DataFrame.create({ v: [0, 5, 9, 10, 15] }).frame,
                'v',
                {
                  bins,
                  labels,
                },
              ),
            );
            expect(res.frame.columns.v_category).toEqual([
              null,
              null,
              null,
              null,
              'High',
            ]);
          });

          test('right=true, includeLowest=true – only exact lower boundary', () => {
            const res = new DataFrame(
              cutWithDeps(DataFrame.create({ v: [0, 1] }).frame, 'v', {
                bins,
                labels,
                includeLowest: true,
              }),
            );
            expect(res.frame.columns.v_category).toEqual(['Low', null]);
          });

          test('right=false, includeLowest=true – only exact upper boundary', () => {
            const res = new DataFrame(
              cutWithDeps(DataFrame.create({ v: [19.9999, 20] }).frame, 'v', {
                bins,
                labels,
                right: false,
                includeLowest: true,
              }),
            );
            expect(res.frame.columns.v_category).toEqual(['Low', 'High']);
          });
        });

        describe('negative values and floats', () => {
          const bins = [-100, 0, 50, 100];
          const labels = ['Neg', 'PosSmall', 'PosBig'];

          test('correctly handles negative and float values', () => {
            const dfNeg = DataFrame.create({
              x: [-100, -50, 0, 0.1, 49.9, 50, 99.99],
            });
            const res = new DataFrame(
              cutWithDeps(dfNeg.frame, 'x', {
                bins,
                labels,
                includeLowest: true,
              }),
            );
            expect(res.frame.columns.x_category).toEqual([
              'Neg', // exact lower edge
              null, // interior point of first interval → null
              null, // upper edge of first interval → skipped
              'PosSmall',
              'PosSmall',
              'PosSmall',
              'PosBig',
            ]);
          });
        });

        describe('scaling: > 100 bins', () => {
          const bins = Array.from({ length: 101 }, (_, i) => i * 10); // 0..1000
          const labels = bins.slice(0, -1).map((_, i) => `B${i}`);

          test('values are classified without skips (except the first interval)', () => {
            const dfMany = DataFrame.create({ num: [5, 15, 555, 999, 1000] });
            const res = new DataFrame(
              cutWithDeps(dfMany.frame, 'num', { bins, labels }),
            );
            expect(res.frame.columns.num_category).toEqual([
              null, // first interval skipped
              'B1', // interior of interval #1
              'B55',
              'B99',
              'B99', // exact upper edge retains last label
            ]);
          });
        });
      });
    });
  });
});
