// test/io/transformers/nestedToFrame.test.js

import { describe, test, expect } from 'vitest';
import { nestedToFrame } from '../../../src/io/transformers/nestedToFrame.js';

describe('nestedToFrame', () => {
  test('should transform nested objects with auto-flattening', () => {
    const data = [
      {
        id: 1,
        user: { name: 'John', age: 32 },
      },
      {
        id: 2,
        user: { name: 'Jane', age: 28 },
      },
    ];

    const result = nestedToFrame(data);

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('id', 1);
    expect(result[0]).toHaveProperty('user.name', 'John');
    expect(result[0]).toHaveProperty('user.age', 32);
    expect(result[1]).toHaveProperty('id', 2);
    expect(result[1]).toHaveProperty('user.name', 'Jane');
    expect(result[1]).toHaveProperty('user.age', 28);
  });

  test('should transform nested objects with specified paths', () => {
    const data = [
      {
        id: 1,
        user: { name: 'John', age: 32 },
      },
      {
        id: 2,
        user: { name: 'Jane', age: 28 },
      },
    ];

    const result = nestedToFrame(data, {
      paths: {
        userId: 'id',
        userName: 'user.name',
        userAge: 'user.age',
      },
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('userId', 1);
    expect(result[0]).toHaveProperty('userName', 'John');
    expect(result[0]).toHaveProperty('userAge', 32);
    expect(result[1]).toHaveProperty('userId', 2);
    expect(result[1]).toHaveProperty('userName', 'Jane');
    expect(result[1]).toHaveProperty('userAge', 28);
  });

  test('should handle array aggregations', () => {
    const data = [
      {
        id: 1,
        orders: [
          { id: 101, amount: 150 },
          { id: 102, amount: 75 },
        ],
      },
      {
        id: 2,
        orders: [
          { id: 103, amount: 200 },
          { id: 104, amount: 50 },
        ],
      },
    ];

    const result = nestedToFrame(data, {
      paths: {
        id: 'id',
      },
      aggregations: {
        orderCount: { path: 'orders', method: 'count' },
        totalAmount: { path: 'orders', method: 'sum', property: 'amount' },
        avgAmount: { path: 'orders', method: 'avg', property: 'amount' },
        minAmount: { path: 'orders', method: 'min', property: 'amount' },
        maxAmount: { path: 'orders', method: 'max', property: 'amount' },
      },
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('id', 1);
    expect(result[0]).toHaveProperty('orderCount', 2);
    expect(result[0]).toHaveProperty('totalAmount', 225);
    expect(result[0]).toHaveProperty('avgAmount', 112.5);
    expect(result[0]).toHaveProperty('minAmount', 75);
    expect(result[0]).toHaveProperty('maxAmount', 150);

    expect(result[1]).toHaveProperty('id', 2);
    expect(result[1]).toHaveProperty('orderCount', 2);
    expect(result[1]).toHaveProperty('totalAmount', 250);
    expect(result[1]).toHaveProperty('avgAmount', 125);
    expect(result[1]).toHaveProperty('minAmount', 50);
    expect(result[1]).toHaveProperty('maxAmount', 200);
  });

  test('should handle first, last and join aggregations', () => {
    const data = [
      {
        id: 1,
        tags: ['javascript', 'dataframe', 'library'],
      },
      {
        id: 2,
        tags: ['typescript', 'data'],
      },
    ];

    const result = nestedToFrame(data, {
      paths: {
        id: 'id',
      },
      aggregations: {
        firstTag: { path: 'tags', method: 'first' },
        lastTag: { path: 'tags', method: 'last' },
        allTags: { path: 'tags', method: 'join' },
      },
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('id', 1);
    expect(result[0]).toHaveProperty('firstTag', 'javascript');
    expect(result[0]).toHaveProperty('lastTag', 'library');
    expect(result[0]).toHaveProperty(
      'allTags',
      'javascript, dataframe, library',
    );

    expect(result[1]).toHaveProperty('id', 2);
    expect(result[1]).toHaveProperty('firstTag', 'typescript');
    expect(result[1]).toHaveProperty('lastTag', 'data');
    expect(result[1]).toHaveProperty('allTags', 'typescript, data');
  });

  test('should handle empty arrays and null values', () => {
    const data = [
      {
        id: 1,
        orders: [],
      },
      {
        id: 2,
        orders: null,
      },
    ];

    const result = nestedToFrame(data, {
      paths: {
        id: 'id',
      },
      aggregations: {
        orderCount: { path: 'orders', method: 'count' },
        totalAmount: { path: 'orders', method: 'sum', property: 'amount' },
        avgAmount: { path: 'orders', method: 'avg', property: 'amount' },
      },
    });

    expect(result).toHaveLength(2);
    expect(result[0]).toHaveProperty('id', 1);
    expect(result[0]).toHaveProperty('orderCount', 0);
    expect(result[0]).toHaveProperty('totalAmount', 0);
    expect(result[0]).toHaveProperty('avgAmount', null);

    expect(result[1]).toHaveProperty('id', 2);
    expect(result[1]).toHaveProperty('orderCount', null);
    expect(result[1]).toHaveProperty('totalAmount', null);
    expect(result[1]).toHaveProperty('avgAmount', null);
  });

  test('should throw error for non-array input', () => {
    expect(() => nestedToFrame('not an array')).toThrow(
      'Data must be an array of objects',
    );
    expect(() => nestedToFrame({})).toThrow('Data must be an array of objects');
    expect(() => nestedToFrame(null)).toThrow(
      'Data must be an array of objects',
    );
  });

  test('should handle dynamic typing', () => {
    const data = [
      {
        id: '1',
        user: { name: 'John', age: '32' },
        active: 'true',
      },
    ];

    const result = nestedToFrame(data, {
      paths: {
        id: 'id',
        name: 'user.name',
        age: 'user.age',
        active: 'active',
      },
      dynamicTyping: true,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toHaveProperty('id', 1);
    expect(result[0]).toHaveProperty('name', 'John');
    expect(result[0]).toHaveProperty('age', 32);
    expect(result[0]).toHaveProperty('active', true);
  });
});
