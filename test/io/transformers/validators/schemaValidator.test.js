import { describe, it, expect } from 'vitest';
import {
  createValidator,
  createColumnValidator,
  FIELD_TYPES,
  ValidationError,
} from '../../../../src/io/transformers/validators/schemaValidator.js';
import { DataFrame } from '../../../../src/core/dataframe/DataFrame.js';

describe('Schema Validator', () => {
  describe('createValidator', () => {
    it('should validate simple objects', () => {
      const schema = {
        name: { type: FIELD_TYPES.STRING, required: true },
        age: { type: FIELD_TYPES.INTEGER, min: 0, max: 120 },
        email: {
          type: FIELD_TYPES.STRING,
          pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        },
      };

      const validator = createValidator(schema);

      // Valid object
      const validObject = {
        name: 'John Doe',
        age: 30,
        email: 'john@example.com',
      };

      expect(() => validator(validObject)).not.toThrow();

      // Invalid: missing required field
      const missingRequired = {
        age: 30,
        email: 'john@example.com',
      };

      expect(() => validator(missingRequired)).toThrow(ValidationError);
      expect(() => validator(missingRequired)).toThrow(/required/);

      // Invalid: wrong type
      const wrongType = {
        name: 'John Doe',
        age: '30', // string instead of integer
        email: 'john@example.com',
      };

      expect(() => validator(wrongType)).toThrow(ValidationError);
      expect(() => validator(wrongType)).toThrow(/integer/);

      // Invalid: out of range
      const outOfRange = {
        name: 'John Doe',
        age: 150, // above max
        email: 'john@example.com',
      };

      expect(() => validator(outOfRange)).toThrow(ValidationError);
      expect(() => validator(outOfRange)).toThrow(/at most 120/);

      // Invalid: pattern mismatch
      const patternMismatch = {
        name: 'John Doe',
        age: 30,
        email: 'not-an-email',
      };

      expect(() => validator(patternMismatch)).toThrow(ValidationError);
      expect(() => validator(patternMismatch)).toThrow(/pattern/);
    });

    it('should validate nested objects', () => {
      const schema = {
        name: { type: FIELD_TYPES.STRING },
        address: {
          type: FIELD_TYPES.OBJECT,
          properties: {
            street: { type: FIELD_TYPES.STRING },
            city: { type: FIELD_TYPES.STRING },
            zipCode: { type: FIELD_TYPES.STRING, pattern: /^\d{5}$/ },
          },
        },
      };

      const validator = createValidator(schema);

      // Valid object
      const validObject = {
        name: 'John Doe',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          zipCode: '12345',
        },
      };

      expect(() => validator(validObject)).not.toThrow();

      // Invalid: nested field pattern mismatch
      const invalidZip = {
        name: 'John Doe',
        address: {
          street: '123 Main St',
          city: 'Anytown',
          zipCode: '1234', // too short
        },
      };

      expect(() => validator(invalidZip)).toThrow(ValidationError);
      expect(() => validator(invalidZip)).toThrow(/pattern/);
    });

    it('should validate arrays', () => {
      const schema = {
        name: { type: FIELD_TYPES.STRING },
        tags: {
          type: FIELD_TYPES.ARRAY,
          minLength: 1,
          maxLength: 5,
          items: { type: FIELD_TYPES.STRING },
        },
      };

      const validator = createValidator(schema);

      // Valid object
      const validObject = {
        name: 'Product',
        tags: ['electronics', 'gadget', 'phone'],
      };

      expect(() => validator(validObject)).not.toThrow();

      // Invalid: array too short
      const tooShort = {
        name: 'Product',
        tags: [],
      };

      expect(() => validator(tooShort)).toThrow(ValidationError);
      expect(() => validator(tooShort)).toThrow(/at least 1/);

      // Invalid: array too long
      const tooLong = {
        name: 'Product',
        tags: ['a', 'b', 'c', 'd', 'e', 'f'],
      };

      expect(() => validator(tooLong)).toThrow(ValidationError);
      expect(() => validator(tooLong)).toThrow(/at most 5/);

      // Invalid: wrong item type
      const wrongItemType = {
        name: 'Product',
        tags: ['electronics', 42, 'phone'],
      };

      expect(() => validator(wrongItemType)).toThrow(ValidationError);
      expect(() => validator(wrongItemType)).toThrow(/must be a string/);
    });

    it('should apply default values', () => {
      const schema = {
        name: { type: FIELD_TYPES.STRING, required: true },
        age: { type: FIELD_TYPES.INTEGER, defaultValue: 18 },
        active: { type: FIELD_TYPES.BOOLEAN, defaultValue: true },
      };

      const validator = createValidator(schema);

      // Object with missing optional fields
      const partialObject = {
        name: 'John Doe',
      };

      const validated = validator(partialObject);

      expect(validated).toEqual({
        name: 'John Doe',
        age: 18,
        active: true,
      });
    });

    it('should validate arrays of objects', () => {
      const schema = {
        id: { type: FIELD_TYPES.INTEGER },
        name: { type: FIELD_TYPES.STRING },
      };

      const validator = createValidator(schema);

      // Valid array
      const validArray = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];

      expect(() => validator(validArray)).not.toThrow();

      // Invalid: item in array
      const invalidArray = [
        { id: 1, name: 'Item 1' },
        { id: '2', name: 'Item 2' }, // id should be integer
        { id: 3, name: 'Item 3' },
      ];

      expect(() => validator(invalidArray)).toThrow(ValidationError);
      expect(() => validator(invalidArray)).toThrow(/integer/);
    });
  });

  describe('createColumnValidator', () => {
    it('should validate DataFrame columns', () => {
      const columnSchema = {
        id: { type: FIELD_TYPES.INTEGER, required: true },
        name: { type: FIELD_TYPES.STRING, required: true },
        age: { type: FIELD_TYPES.INTEGER, min: 0 },
      };

      const validator = createColumnValidator(columnSchema);

      // Valid DataFrame
      const validDF = DataFrame.fromRecords([
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Jane', age: 25 },
      ]);

      expect(() => validator(validDF)).not.toThrow();

      // Invalid: missing required column
      const missingColumn = DataFrame.fromRecords([
        { id: 1, age: 30 },
        { id: 2, age: 25 },
      ]);

      expect(() => validator(missingColumn)).toThrow(ValidationError);
      expect(() => validator(missingColumn)).toThrow(
        /Required column 'name' is missing/,
      );

      // Invalid: wrong value type
      const wrongType = DataFrame.fromRecords([
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Jane', age: 'twenty-five' },
      ]);

      expect(() => validator(wrongType)).toThrow(ValidationError);
      expect(() => validator(wrongType)).toThrow(/must be an integer/);

      // Invalid: out of range
      const outOfRange = DataFrame.fromRecords([
        { id: 1, name: 'John', age: 30 },
        { id: 2, name: 'Jane', age: -5 },
      ]);

      expect(() => validator(outOfRange)).toThrow(ValidationError);
      expect(() => validator(outOfRange)).toThrow(/at least 0/);
    });
  });
});
