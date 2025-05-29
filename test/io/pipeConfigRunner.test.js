import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  registerReader,
  registerTransformer,
  registerWriter,
  createPipelineFromConfig,
  runPipeline,
} from '../../src/io/pipeConfigRunner.js';
import { DataFrame } from '../../src/core/dataframe/DataFrame.js';

// Mock environment detection
vi.mock('../../src/io/utils/environment.js', () => ({
  isNodeJs: vi.fn().mockReturnValue(true),
  detectEnvironment: vi.fn().mockReturnValue('node'),
}));

// Mock fs module
vi.mock('fs/promises', () => ({
  readFile: vi.fn().mockImplementation((path) => {
    if (path.endsWith('.json')) {
      return Promise.resolve(
        JSON.stringify({
          reader: { type: 'mock', params: { source: 'test.csv' } },
          transformers: [
            { type: 'filter', params: { predicate: 'row.value > 0' } },
          ],
        }),
      );
    } else if (path.endsWith('.yml') || path.endsWith('.yaml')) {
      return Promise.resolve(`
reader:
  type: mock
  params:
    source: test.csv
transformers:
  - type: filter
    params:
      predicate: row.value > 0
`);
    }
    return Promise.reject(new Error('File not found'));
  }),
}));

// Mock js-yaml
vi.mock('js-yaml', () => ({
  load: vi.fn().mockImplementation((content) => ({
    reader: { type: 'mock', params: { source: 'test.csv' } },
    transformers: [{ type: 'filter', params: { predicate: 'row.value > 0' } }],
  })),
}));

describe('Pipeline Config Runner', () => {
  // Mock readers, transformers, and writers
  const mockReader = vi.fn().mockResolvedValue([
    { id: 1, value: 10 },
    { id: 2, value: -5 },
    { id: 3, value: 20 },
  ]);

  const mockTransformer = vi.fn().mockImplementation(
    (params) => (data) =>
      data.map((item) => ({
        ...item,
        transformed: true,
        params,
      })),
  );

  const mockWriter = vi.fn().mockImplementation((data) => ({ written: data }));

  beforeEach(() => {
    // Register mock components
    registerReader('mock', mockReader);
    registerTransformer('custom', mockTransformer);
    registerWriter('mock', mockWriter);

    // Clear mocks
    mockReader.mockClear();
    mockTransformer.mockClear();
    mockWriter.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createPipelineFromConfig', () => {
    it('should create a pipeline with reader and transformers', async () => {
      const config = {
        reader: {
          type: 'mock',
          params: {
            source: 'test.csv',
          },
        },
        transformers: [
          {
            type: 'filter',
            params: {
              predicate: 'row.value > 0',
            },
          },
        ],
      };

      const pipeline = createPipelineFromConfig(config);
      const result = await pipeline();

      // Check that reader was called with correct params
      expect(mockReader).toHaveBeenCalledWith({ source: 'test.csv' });

      // Check that filter was applied correctly
      expect(result).toEqual([
        { id: 1, value: 10 },
        { id: 3, value: 20 },
      ]);
    });

    it('should create a pipeline with reader, transformers, and writer', async () => {
      const config = {
        reader: {
          type: 'mock',
          params: {
            source: 'test.csv',
          },
        },
        transformers: [
          {
            type: 'custom',
            params: {
              option: 'test',
            },
          },
        ],
        writer: {
          type: 'mock',
          params: {
            destination: 'output.csv',
          },
        },
      };

      const pipeline = createPipelineFromConfig(config);
      const result = await pipeline();

      // Check that reader was called
      expect(mockReader).toHaveBeenCalled();

      // Check that transformer was applied
      expect(mockTransformer).toHaveBeenCalledWith({ option: 'test' });

      // Check that writer was called with transformed data
      expect(mockWriter).toHaveBeenCalledWith(
        [
          { id: 1, value: 10, transformed: true, params: { option: 'test' } },
          { id: 2, value: -5, transformed: true, params: { option: 'test' } },
          { id: 3, value: 20, transformed: true, params: { option: 'test' } },
        ],
        { destination: 'output.csv' },
      );

      // Check that the result is the transformed data, not the writer's return value
      // This is because createPipeline returns the result of the last transformer, not the writer
      expect(result).toEqual([
        { id: 1, value: 10, transformed: true, params: { option: 'test' } },
        { id: 2, value: -5, transformed: true, params: { option: 'test' } },
        { id: 3, value: 20, transformed: true, params: { option: 'test' } },
      ]);
    });

    it('should throw error for unknown reader type', () => {
      const config = {
        reader: {
          type: 'unknown',
          params: {},
        },
      };

      expect(() => createPipelineFromConfig(config)).toThrow(
        'Unknown reader type',
      );
    });

    it('should throw error for unknown transformer type', () => {
      const config = {
        reader: {
          type: 'mock',
          params: {},
        },
        transformers: [
          {
            type: 'unknown',
            params: {},
          },
        ],
      };

      // Ожидаем, что ошибка будет выброшена при создании pipeline
      expect(() => createPipelineFromConfig(config)).toThrow(
        'Unknown transformer type',
      );
    });

    it('should throw error for unknown writer type', () => {
      const config = {
        reader: {
          type: 'mock',
          params: {},
        },
        writer: {
          type: 'unknown',
          params: {},
        },
      };

      // Ожидаем, что ошибка будет выброшена при создании pipeline
      expect(() => createPipelineFromConfig(config)).toThrow(
        'Unknown writer type',
      );
    });
  });

  describe('Built-in transformers', () => {
    it('should apply filter transformer', async () => {
      const config = {
        reader: {
          type: 'mock',
          params: {},
        },
        transformers: [
          {
            type: 'filter',
            params: {
              predicate: 'row.value > 0',
            },
          },
        ],
      };

      const pipeline = createPipelineFromConfig(config);
      const result = await pipeline();

      expect(result).toEqual([
        { id: 1, value: 10 },
        { id: 3, value: 20 },
      ]);
    });

    it('should apply map transformer', async () => {
      const config = {
        reader: {
          type: 'mock',
          params: {},
        },
        transformers: [
          {
            type: 'map',
            params: {
              transform: '{ ...row, doubled: row.value * 2 }',
            },
          },
        ],
      };

      const pipeline = createPipelineFromConfig(config);
      const result = await pipeline();

      expect(result).toEqual([
        { id: 1, value: 10, doubled: 20 },
        { id: 2, value: -5, doubled: -10 },
        { id: 3, value: 20, doubled: 40 },
      ]);
    });

    it('should apply sort transformer', async () => {
      const config = {
        reader: {
          type: 'mock',
          params: {},
        },
        transformers: [
          {
            type: 'sort',
            params: {
              key: 'value',
              ascending: true,
            },
          },
        ],
      };

      const pipeline = createPipelineFromConfig(config);
      const result = await pipeline();

      expect(result).toEqual([
        { id: 2, value: -5 },
        { id: 1, value: 10 },
        { id: 3, value: 20 },
      ]);
    });

    it('should apply limit transformer', async () => {
      const config = {
        reader: {
          type: 'mock',
          params: {},
        },
        transformers: [
          {
            type: 'limit',
            params: {
              count: 2,
            },
          },
        ],
      };

      const pipeline = createPipelineFromConfig(config);
      const result = await pipeline();

      expect(result).toEqual([
        { id: 1, value: 10 },
        { id: 2, value: -5 },
      ]);
    });

    it('should apply toDataFrame transformer', async () => {
      const config = {
        reader: {
          type: 'mock',
          params: {},
        },
        transformers: [
          {
            type: 'toDataFrame',
            params: {},
          },
        ],
      };

      const pipeline = createPipelineFromConfig(config);
      const result = await pipeline();

      expect(result).toBeInstanceOf(DataFrame);
      expect(result.columns).toEqual(['id', 'value']);
      expect(result.rowCount).toBe(3);
    });
  });

  describe('runPipeline', () => {
    it('should run pipeline from config object', async () => {
      const config = {
        reader: {
          type: 'mock',
          params: {
            source: 'test.csv',
          },
        },
        transformers: [
          {
            type: 'filter',
            params: {
              predicate: 'row.value > 0',
            },
          },
        ],
      };

      const result = await runPipeline(config);

      expect(mockReader).toHaveBeenCalled();
      expect(result).toEqual([
        { id: 1, value: 10 },
        { id: 3, value: 20 },
      ]);
    });

    it('should run pipeline from JSON file', async () => {
      const fs = await import('fs/promises');

      await runPipeline('/path/to/config.json');

      expect(fs.readFile).toHaveBeenCalledWith('/path/to/config.json', 'utf8');
      expect(mockReader).toHaveBeenCalled();
    });

    it('should run pipeline from YAML file', async () => {
      const fs = await import('fs/promises');
      const yaml = await import('js-yaml');

      await runPipeline('/path/to/config.yml');

      expect(fs.readFile).toHaveBeenCalledWith('/path/to/config.yml', 'utf8');
      expect(yaml.load).toHaveBeenCalled();
      expect(mockReader).toHaveBeenCalled();
    });

    it('should pass arguments to pipeline', async () => {
      const config = {
        reader: {
          type: 'mock',
          params: {},
        },
      };

      await runPipeline(config, { extraParam: 'value' });

      expect(mockReader).toHaveBeenCalledWith({ extraParam: 'value' });
    });
  });
});
