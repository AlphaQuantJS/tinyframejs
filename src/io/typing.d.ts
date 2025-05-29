/**
 * Type definitions for TinyFrameJS IO module
 */

import { DataFrame } from '../core/dataframe/DataFrame';

/**
 * Options for readers
 */
export interface ReaderOptions {
  [key: string]: any;
}

/**
 * Reader function type
 * @template T - Output type of the reader
 */
export type Reader<T = any> = (
  source: string | object,
  options?: ReaderOptions,
) => Promise<T>;

/**
 * Transformer function type
 * @template I - Input type
 * @template O - Output type
 */
export type Transformer<I = any, O = any> = (
  data: I,
  options?: object,
) => O | Promise<O>;

/**
 * Writer function type
 * @template T - Input type for the writer
 */
export type Writer<T = any> = (
  data: T,
  destination: string | object,
  options?: object,
) => Promise<void>;

/**
 * Hook function type for API middleware
 */
export type Hook = (
  context: HookContext,
  next: (context: HookContext) => Promise<any>,
) => Promise<any>;

/**
 * Context for hooks
 */
export interface HookContext {
  request: {
    url: string;
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Schema mapping type
 */
export interface SchemaMapping {
  [targetKey: string]: string | SchemaTransform | ((obj: any) => any);
}

/**
 * Schema transform configuration
 */
export interface SchemaTransform {
  path: string;
  transform?: (value: any, obj?: any, index?: number) => any;
}

/**
 * Pipeline function type
 */
export type Pipeline<I = any, O = any> = (input?: I) => Promise<O>;

/**
 * Batch processor options
 */
export interface BatchProcessOptions {
  batchSize?: number;
  onProgress?: (info: {
    processedCount: number;
    batchCount: number;
    lastBatch: any;
  }) => void;
}

/**
 * Stream reader options
 */
export interface StreamReaderOptions extends ReaderOptions {
  batchSize?: number;
  onBatch?: (batch: DataFrame) => void | Promise<any>;
  encoding?: string;
  delimiter?: string;
  header?: boolean;
  skipEmptyLines?: boolean;
  skipLines?: number;
  maxRows?: number;
}

/**
 * Cache options
 */
export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
}

/**
 * Throttle options
 */
export interface ThrottleOptions {
  requestsPerSecond?: number;
  requestsPerMinute?: number;
  requestsPerHour?: number;
  groupByDomain?: boolean;
  onThrottle?: (waitTime: number) => void;
}

/**
 * Auth options
 */
export interface AuthOptions {
  keys?: Array<{ id: string; key: string; [key: string]: any }>;
  authType?: 'bearer' | 'basic' | 'header' | 'query';
  headerName?: string;
  queryParam?: string;
  authFormatter?: (key: string) => string;
  isAuthError?: (error: any) => boolean;
  maxErrorsBeforeDisable?: number;
  resetErrorsAfter?: number;
  rotationStrategy?: 'round-robin' | 'least-used' | 'random';
}

/**
 * API client options
 */
export interface ApiClientOptions {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  auth?: AuthOptions;
  cache?: CacheOptions | false;
  throttle?: ThrottleOptions | false;
  logger?: object | false;
  retry?: {
    retries?: number;
    retryDelay?: number;
    retryOn?: number[];
  };
  hooks?: Hook[];
}
