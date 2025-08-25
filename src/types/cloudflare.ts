// Cloudflare Workers Types
export interface Env {
  // Cloudflare Bindings
  DB: D1Database;
  KV: KVNamespace;
  R2: R2Bucket;
  
  // AI API Keys (Environment Variables)
  OPENAI_API_KEY?: string;
  GEMINI_API_KEY?: string;
  CLAUDE_API_KEY?: string;
  
  // Security
  JWT_SECRET?: string;
  
  // Exchange API Keys
  BINANCE_API_KEY?: string;
  BINANCE_SECRET?: string;
  COINBASE_API_KEY?: string;
  COINBASE_SECRET?: string;
  
  // Notification Services
  TELEGRAM_BOT_TOKEN?: string;
  SENDGRID_API_KEY?: string;
}

declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    dump(): Promise<ArrayBuffer>;
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
    exec(query: string): Promise<D1ExecResult>;
  }

  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    first<T = unknown>(colName?: string): Promise<T>;
    run(): Promise<D1Result>;
    all<T = unknown>(): Promise<D1Result<T>>;
    raw<T = unknown>(): Promise<T[]>;
  }

  interface D1Result<T = Record<string, unknown>> {
    results: T[];
    success: boolean;
    meta: {
      served_by: string;
      duration: number;
      changes: number;
      last_row_id: number;
      changed_db: boolean;
    };
  }

  interface D1ExecResult {
    count: number;
    duration: number;
  }

  interface KVNamespace {
    get(key: string, options?: Partial<KVNamespaceGetOptions<undefined>>): Promise<string | null>;
    get(key: string, type: "text"): Promise<string | null>;
    get(key: string, type: "json"): Promise<any>;
    get(key: string, type: "arrayBuffer"): Promise<ArrayBuffer | null>;
    get(key: string, type: "stream"): Promise<ReadableStream | null>;
    
    put(key: string, value: string | ArrayBuffer | ArrayBufferView | ReadableStream, options?: KVNamespacePutOptions): Promise<void>;
    
    delete(key: string): Promise<void>;
    
    list(options?: KVNamespaceListOptions): Promise<KVNamespaceListResult>;
  }

  interface KVNamespaceGetOptions<Type> {
    type: Type;
    cacheTtl?: number;
  }

  interface KVNamespacePutOptions {
    expiration?: number;
    expirationTtl?: number;
    metadata?: any;
  }

  interface KVNamespaceListOptions {
    limit?: number;
    prefix?: string;
    cursor?: string;
  }

  interface KVNamespaceListResult {
    keys: KVNamespaceListKey[];
    list_complete: boolean;
    cursor?: string;
  }

  interface KVNamespaceListKey {
    name: string;
    expiration?: number;
    metadata?: any;
  }

  interface R2Bucket {
    head(key: string): Promise<R2Object | null>;
    get(key: string, options?: R2GetOptions): Promise<R2ObjectBody | null>;
    put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob, options?: R2PutOptions): Promise<R2Object>;
    delete(key: string | string[]): Promise<void>;
    list(options?: R2ListOptions): Promise<R2Objects>;
    createMultipartUpload(key: string, options?: R2MultipartOptions): Promise<R2MultipartUpload>;
  }

  interface R2Object {
    key: string;
    version: string;
    size: number;
    etag: string;
    httpEtag: string;
    uploaded: Date;
    httpMetadata?: R2HTTPMetadata;
    customMetadata?: Record<string, string>;
    range?: R2Range;
  }

  interface R2ObjectBody extends R2Object {
    body: ReadableStream;
    bodyUsed: boolean;
    arrayBuffer(): Promise<ArrayBuffer>;
    text(): Promise<string>;
    json<T = unknown>(): Promise<T>;
    blob(): Promise<Blob>;
  }

  interface R2GetOptions {
    onlyIf?: R2Conditional;
    range?: R2Range;
  }

  interface R2PutOptions {
    onlyIf?: R2Conditional;
    httpMetadata?: R2HTTPMetadata;
    customMetadata?: Record<string, string>;
    md5?: ArrayBuffer | string;
    sha1?: ArrayBuffer | string;
    sha256?: ArrayBuffer | string;
    sha384?: ArrayBuffer | string;
    sha512?: ArrayBuffer | string;
  }

  interface R2ListOptions {
    limit?: number;
    prefix?: string;
    cursor?: string;
    delimiter?: string;
    startAfter?: string;
    include?: ("httpMetadata" | "customMetadata")[];
  }

  interface R2Objects {
    objects: R2Object[];
    truncated: boolean;
    cursor?: string;
    delimitedPrefixes: string[];
  }

  interface R2HTTPMetadata {
    contentType?: string;
    contentLanguage?: string;
    contentDisposition?: string;
    contentEncoding?: string;
    cacheControl?: string;
    cacheExpiry?: Date;
  }

  interface R2Range {
    offset?: number;
    length?: number;
    suffix?: number;
  }

  interface R2Conditional {
    etagMatches?: string;
    etagDoesNotMatch?: string;
    uploadedBefore?: Date;
    uploadedAfter?: Date;
  }

  interface R2MultipartUpload {
    key: string;
    uploadId: string;
    abort(): Promise<void>;
    complete(uploadedParts: R2UploadedPart[]): Promise<R2Object>;
    uploadPart(partNumber: number, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | Blob): Promise<R2UploadedPart>;
  }

  interface R2MultipartOptions {
    httpMetadata?: R2HTTPMetadata;
    customMetadata?: Record<string, string>;
  }

  interface R2UploadedPart {
    partNumber: number;
    etag: string;
  }

  // Global functions available in Cloudflare Workers
  function btoa(data: string): string;
  function atob(data: string): string;
  
  interface Console {
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
    info(...args: any[]): void;
  }
  
  // console is available globally
}