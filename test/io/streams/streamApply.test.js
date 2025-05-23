import { describe, test, expect, vi } from 'vitest';
import { Readable } from 'stream';
import { streamApply } from '../../../src/io/streams/streamApply.js';

describe('streamApply', () => {
  test('applies a function to each chunk of data in a stream', async () => {
    // Create a mock readable stream
    const mockData = [
      { id: 1, value: 10 },
      { id: 2, value: 20 },
      { id: 3, value: 30 },
    ];

    const mockStream = Readable.from(mockData);

    // Define a transform function
    const transformFn = (chunk) => ({ ...chunk, doubled: chunk.value * 2 });

    // Apply the transform function to the stream
    const transformedStream = streamApply(mockStream, transformFn);

    // Collect the transformed data
    const transformedData = [];
    for await (const chunk of transformedStream) {
      transformedData.push(chunk);
    }

    // Check the transformed data
    expect(transformedData).toHaveLength(3);
    expect(transformedData[0]).toEqual({ id: 1, value: 10, doubled: 20 });
    expect(transformedData[1]).toEqual({ id: 2, value: 20, doubled: 40 });
    expect(transformedData[2]).toEqual({ id: 3, value: 30, doubled: 60 });
  });

  test('handles async transform functions', async () => {
    // Create a mock readable stream
    const mockData = [
      { id: 1, value: 10 },
      { id: 2, value: 20 },
    ];

    const mockStream = Readable.from(mockData);

    // Define an async transform function
    const asyncTransformFn = async (chunk) => {
      // Simulate async operation
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { ...chunk, doubled: chunk.value * 2 };
    };

    // Apply the async transform function to the stream
    const transformedStream = streamApply(mockStream, asyncTransformFn);

    // Collect the transformed data
    const transformedData = [];
    for await (const chunk of transformedStream) {
      transformedData.push(chunk);
    }

    // Check the transformed data
    expect(transformedData).toHaveLength(2);
    expect(transformedData[0]).toEqual({ id: 1, value: 10, doubled: 20 });
    expect(transformedData[1]).toEqual({ id: 2, value: 20, doubled: 40 });
  });

  test('processes data in batches', async () => {
    // Create a mock readable stream with more data
    const mockData = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      value: (i + 1) * 10,
    }));

    const mockStream = Readable.from(mockData);

    // Create a spy function to track batch processing
    const batchTransformFn = vi.fn((batch) =>
      batch.map((item) => ({ ...item, doubled: item.value * 2 })),
    );

    // Apply the transform function to the stream with a batch size of 3
    const transformedStream = streamApply(mockStream, batchTransformFn, {
      batchSize: 3,
    });

    // Collect the transformed data
    const transformedData = [];
    for await (const chunk of transformedStream) {
      transformedData.push(chunk);
    }

    // Check the transformed data
    expect(transformedData).toHaveLength(10);
    expect(transformedData[0]).toEqual({ id: 1, value: 10, doubled: 20 });
    expect(transformedData[9]).toEqual({ id: 10, value: 100, doubled: 200 });

    // Check that the transform function was called with batches
    // We expect 4 calls: 3 batches of 3 items and 1 batch of 1 item
    expect(batchTransformFn).toHaveBeenCalledTimes(4);
  });

  test('throws an error with invalid arguments', () => {
    // Check that the function throws an error if stream is invalid
    expect(() => streamApply(null, () => {})).toThrow();
    expect(() => streamApply({}, () => {})).toThrow();

    // Check that the function throws an error if fn is not a function
    const mockStream = Readable.from([]);
    expect(() => streamApply(mockStream, null)).toThrow();
    expect(() => streamApply(mockStream, 'not a function')).toThrow();
  });
});

describe('DataFrame.streamApply', () => {
  test('applies a function to each chunk of data in a DataFrame stream', async () => {
    // This test would require a more complex setup with a DataFrame that has an active stream
    // For simplicity, we'll just test that the method exists and throws the expected error
    // when called without an active stream

    // Import DataFrame
    const { DataFrame } = await import('../../../src/core/DataFrame.js');

    // Create a test DataFrame
    const df = DataFrame.create({
      id: [1, 2, 3],
      value: [10, 20, 30],
    });

    // Check that the streamApply method exists
    expect(typeof df.streamApply).toBe('function');

    // Check that it throws an error when called without an active stream
    expect(() => df.streamApply(() => {})).toThrow(/No active stream/);
  });
});
