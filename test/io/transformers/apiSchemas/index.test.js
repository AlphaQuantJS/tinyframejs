import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  registerSchema,
  getSchema,
  applySchema,
  transformData,
  clearSchemas,
} from '../../../../src/io/transformers/apiSchemas/index.js';

describe('API Schema Registry', () => {
  // Clear schemas before each test
  beforeEach(() => {
    clearSchemas();
  });

  describe('registerSchema', () => {
    it('should register a schema', () => {
      const testSchema = {
        name: 'test',
        transform: (data) => ({ transformed: data }),
      };

      registerSchema('testSchema', testSchema);

      const retrievedSchema = getSchema('testSchema');
      expect(retrievedSchema).toEqual(testSchema);
    });

    it('should throw error when registering schema without name', () => {
      const testSchema = {
        transform: (data) => ({ transformed: data }),
      };

      expect(() => registerSchema('testSchema', testSchema)).toThrow(/name/);
    });

    it('should throw error when registering schema without transform function', () => {
      const testSchema = {
        name: 'test',
      };

      expect(() => registerSchema('testSchema', testSchema)).toThrow(
        /transform/,
      );
    });

    it('should overwrite existing schema when force is true', () => {
      const originalSchema = {
        name: 'test',
        transform: (data) => ({ original: data }),
      };

      const newSchema = {
        name: 'test2',
        transform: (data) => ({ new: data }),
      };

      registerSchema('testSchema', originalSchema);
      registerSchema('testSchema', newSchema, true);

      const retrievedSchema = getSchema('testSchema');
      expect(retrievedSchema).toEqual(newSchema);
    });

    it('should throw error when overwriting schema without force flag', () => {
      const originalSchema = {
        name: 'test',
        transform: (data) => ({ original: data }),
      };

      const newSchema = {
        name: 'test2',
        transform: (data) => ({ new: data }),
      };

      registerSchema('testSchema', originalSchema);

      expect(() => registerSchema('testSchema', newSchema)).toThrow(
        /already exists/,
      );
    });
  });

  describe('getSchema', () => {
    it('should return null for non-existent schema', () => {
      const schema = getSchema('nonExistentSchema');
      expect(schema).toBeNull();
    });

    it('should return registered schema', () => {
      const testSchema = {
        name: 'test',
        transform: (data) => ({ transformed: data }),
      };

      registerSchema('testSchema', testSchema);

      const retrievedSchema = getSchema('testSchema');
      expect(retrievedSchema).toEqual(testSchema);
    });
  });

  describe('applySchema', () => {
    it('should apply schema transformation to data', () => {
      const testSchema = {
        name: 'test',
        transform: (data) => ({
          transformed: true,
          value: data.value * 2,
        }),
      };

      registerSchema('testSchema', testSchema);

      const data = { value: 10 };
      const transformed = applySchema('testSchema', data);

      expect(transformed).toEqual({
        transformed: true,
        value: 20,
      });
    });

    it('should return original data when schema does not exist', () => {
      const data = { value: 10 };
      const transformed = applySchema('nonExistentSchema', data);

      expect(transformed).toEqual(data);
    });

    it('should handle errors in transform function', () => {
      // Mock console.error
      const originalConsoleError = console.error;
      console.error = vi.fn();

      const testSchema = {
        name: 'test',
        transform: (data) => {
          throw new Error('Transform error');
        },
      };

      registerSchema('testSchema', testSchema);

      const data = { value: 10 };
      const transformed = applySchema('testSchema', data);

      expect(transformed).toEqual(data);
      expect(console.error).toHaveBeenCalledWith(
        'Error applying schema testSchema:',
        expect.any(Error),
      );

      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe('transformData', () => {
    it('should transform data using specified schema', () => {
      const testSchema = {
        name: 'test',
        transform: (data) => ({
          transformed: true,
          value: data.value * 2,
        }),
      };

      registerSchema('testSchema', testSchema);

      const data = { value: 10 };
      const transformed = transformData(data, 'testSchema');

      expect(transformed).toEqual({
        transformed: true,
        value: 20,
      });
    });

    it('should return original data when schema name is not provided', () => {
      const data = { value: 10 };
      const transformed = transformData(data);

      expect(transformed).toEqual(data);
    });

    it('should return original data when schema does not exist', () => {
      const data = { value: 10 };
      const transformed = transformData(data, 'nonExistentSchema');

      expect(transformed).toEqual(data);
    });
  });

  describe('clearSchemas', () => {
    it('should clear all registered schemas', () => {
      const testSchema1 = {
        name: 'test1',
        transform: (data) => ({ transformed1: data }),
      };

      const testSchema2 = {
        name: 'test2',
        transform: (data) => ({ transformed2: data }),
      };

      registerSchema('testSchema1', testSchema1);
      registerSchema('testSchema2', testSchema2);

      // Verify schemas are registered
      expect(getSchema('testSchema1')).not.toBeNull();
      expect(getSchema('testSchema2')).not.toBeNull();

      // Clear schemas
      clearSchemas();

      // Verify schemas are cleared
      expect(getSchema('testSchema1')).toBeNull();
      expect(getSchema('testSchema2')).toBeNull();
    });
  });
});
