import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  writeArrow,
  writeArrowStream,
  addArrowBatchMethods,
} from '../../../src/io/writers/arrow.js';
import { DataFrame } from '../../../src/core/dataframe/DataFrame.js';
import { isNodeJs } from '../../../src/io/utils/environment.js';

// Mock Apache Arrow
vi.mock('apache-arrow', () => ({
  tableToIPC: vi.fn().mockReturnValue(Buffer.from('mock-arrow-data')),
  Table: {
    new: vi.fn().mockReturnValue({ mockArrowTable: true }),
  },
  recordBatchStreamWriter: vi.fn().mockReturnValue({
    pipe: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
  }),
  Codec: {
    ZSTD: 'zstd-codec',
    LZ4: 'lz4-codec',
  },
  makeData: vi.fn().mockReturnValue({ mockArrowData: true }),
}));

// Mock browser version of Apache Arrow
vi.mock('@apache-arrow/es2015-esm', () => ({
  tableToIPC: vi.fn().mockReturnValue(new Uint8Array([1, 2, 3])),
  Table: {
    new: vi.fn().mockReturnValue({ mockArrowTable: true }),
  },
  recordBatchStreamWriter: vi.fn().mockReturnValue({
    pipe: vi.fn(),
    write: vi.fn(),
    end: vi.fn(),
  }),
  Codec: {
    ZSTD: 'zstd-codec',
    LZ4: 'lz4-codec',
  },
  makeData: vi.fn().mockReturnValue({ mockArrowData: true }),
}));

// Mock environment detection
vi.mock('../../../src/io/utils/environment.js', () => ({
  isNodeJs: vi.fn().mockReturnValue(true),
  detectEnvironment: vi.fn().mockReturnValue('node'),
  isBrowser: vi.fn().mockReturnValue(false),
}));

// Mock fs module
vi.mock('fs/promises', () => ({
  writeFile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('fs', () => {
  const mockWriteStream = {
    on: vi.fn().mockImplementation(function(event, callback) {
      if (event === 'finish') {
        setTimeout(callback, 0);
      }
      return this;
    }),
    write: vi.fn().mockImplementation((data, callback) => {
      if (callback) callback();
      return true;
    }),
  };

  return {
    createWriteStream: vi.fn().mockReturnValue(mockWriteStream),
  };
});

describe('Arrow Writer', () => {
  let testDataFrame;

  beforeEach(() => {
    // Create a test DataFrame
    testDataFrame = DataFrame.fromRows([
      { id: 1, name: 'Alice', age: 30 },
      { id: 2, name: 'Bob', age: 25 },
      { id: 3, name: 'Charlie', age: 35 },
    ]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('writeArrow', () => {
    it('should convert DataFrame to Arrow format', async () => {
      const arrow = await import('apache-arrow');

      const result = await writeArrow(testDataFrame);

      expect(arrow.Table.new).toHaveBeenCalled();
      expect(arrow.tableToIPC).toHaveBeenCalledWith(
        { mockArrowTable: true },
        expect.anything(),
      );
      expect(result).toEqual(Buffer.from('mock-arrow-data'));
    });

    it('should write to file when destination is a string', async () => {
      const fs = await import('fs/promises');
      const arrow = await import('apache-arrow');

      await writeArrow(testDataFrame, '/path/to/output.arrow');

      expect(arrow.Table.new).toHaveBeenCalled();
      expect(arrow.tableToIPC).toHaveBeenCalled();
      expect(fs.writeFile).toHaveBeenCalledWith(
        '/path/to/output.arrow',
        Buffer.from('mock-arrow-data'),
      );
    });

    it('should write to stream when destination has write method', async () => {
      const arrow = await import('apache-arrow');

      const mockStream = {
        write: vi.fn().mockImplementation((data, callback) => {
          if (callback) callback();
          return true;
        }),
      };

      await writeArrow(testDataFrame, mockStream);

      expect(arrow.Table.new).toHaveBeenCalled();
      expect(arrow.tableToIPC).toHaveBeenCalled();
      expect(mockStream.write).toHaveBeenCalledWith(
        Buffer.from('mock-arrow-data'),
        expect.any(Function),
      );
    });

    it('should apply compression options', async () => {
      const arrow = await import('apache-arrow');

      await writeArrow(testDataFrame, null, { compression: 'zstd' });

      expect(arrow.tableToIPC).toHaveBeenCalledWith(
        { mockArrowTable: true },
        { codec: 'zstd-codec' },
      );
    });

    it('should throw error if input is not a DataFrame', async () => {
      await expect(writeArrow({ notADataFrame: true })).rejects.toThrow(
        'DataFrame',
      );
    });

    it('should throw error when trying to write to file in browser', async () => {
      // Setup the browser environment
      isNodeJs.mockReturnValue(false);

      // The function should now throw the correct error about browser environment
      await expect(
        writeArrow(testDataFrame, '/path/to/output.arrow'),
      ).rejects.toThrow(
        'File writing is only supported in Node.js environment',
      );

      // Reset mock
      isNodeJs.mockReturnValue(true);
    });
  });

  describe('writeArrowStream', () => {
    it('should write DataFrame to stream format', async () => {
      const fs = await import('fs');
      const arrow = await import('apache-arrow');

      await writeArrowStream(testDataFrame, '/path/to/output.arrow');

      expect(arrow.Table.new).toHaveBeenCalled();
      expect(arrow.recordBatchStreamWriter).toHaveBeenCalled();
      expect(fs.createWriteStream).toHaveBeenCalledWith(
        '/path/to/output.arrow',
      );
    });

    it('should write to existing stream', async () => {
      const arrow = await import('apache-arrow');

      const mockStream = {
        on: vi.fn().mockImplementation(function(event, callback) {
          if (event === 'finish') {
            setTimeout(callback, 0);
          }
          return this;
        }),
        write: vi.fn(),
      };

      await writeArrowStream(testDataFrame, mockStream);

      const streamWriter = arrow.recordBatchStreamWriter.mock.results[0].value;
      expect(streamWriter.pipe).toHaveBeenCalledWith(mockStream);
      expect(streamWriter.write).toHaveBeenCalledWith({ mockArrowTable: true });
      expect(streamWriter.end).toHaveBeenCalled();
    });

    it('should throw error if destination is not provided', async () => {
      await expect(writeArrowStream(testDataFrame)).rejects.toThrow(
        'Destination is required',
      );
    });
  });

  describe('addArrowBatchMethods', () => {
    it('should add Arrow methods to DataFrame', () => {
      // Create a proper mock DataFrame constructor
      const MockDataFrame = function() {
        // Create private properties
        const _columns = ['id', 'name'];
        const _rowCount = 2;

        // Define getters
        Object.defineProperty(this, 'columns', {
          get: () => _columns,
        });

        Object.defineProperty(this, 'rowCount', {
          get: () => _rowCount,
        });

        // Define methods
        this.col = vi.fn().mockReturnValue({
          toArray: () => [1, 2],
        });
      };

      // Make it look like a DataFrame for instanceof checks
      Object.setPrototypeOf(MockDataFrame.prototype, DataFrame.prototype);

      // Add Arrow methods to the mock class
      const ExtendedDF = addArrowBatchMethods(MockDataFrame);

      // Check that the methods were added
      expect(ExtendedDF.prototype.toArrow).toBeDefined();
      expect(ExtendedDF.prototype.writeArrow).toBeDefined();
      expect(ExtendedDF.prototype.writeArrowStream).toBeDefined();

      // Create an instance of the extended class
      const instance = new ExtendedDF();

      // Just verify the methods exist, but don't actually call them
      // as they would try to perform real operations
      expect(typeof instance.toArrow).toBe('function');
      expect(typeof instance.writeArrow).toBe('function');
      expect(typeof instance.writeArrowStream).toBe('function');
    });
  });
});
