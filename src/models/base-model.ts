// TITAN Trading System - Base Model Interface
// Abstract base class for all database models

import { DatabaseService, QueryResult } from '../services/database-service';

export interface BaseModelConfig {
  tableName: string;
  primaryKey: string;
  timestamps: boolean;
}

export interface ModelValidationResult {
  valid: boolean;
  errors: string[];
}

export abstract class BaseModel<T extends Record<string, any>> {
  protected db: DatabaseService;
  protected config: BaseModelConfig;
  protected fillable: string[];
  protected hidden: string[];
  protected casts: Record<string, string>;

  constructor(
    db: DatabaseService,
    config: BaseModelConfig,
    fillable: string[] = [],
    hidden: string[] = [],
    casts: Record<string, string> = {}
  ) {
    this.db = db;
    this.config = config;
    this.fillable = fillable;
    this.hidden = hidden;
    this.casts = casts;
  }

  // ===========================
  // Abstract Methods (must be implemented by child classes)
  // ===========================

  protected abstract validate(data: Partial<T>): ModelValidationResult;

  // ===========================
  // CRUD Operations
  // ===========================

  public async create(data: Partial<T>): Promise<QueryResult<T>> {
    // Validate input data
    const validation = this.validate(data);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`,
      };
    }

    // Filter only fillable fields
    const filteredData = this.filterFillable(data);
    
    // Add timestamps if enabled
    if (this.config.timestamps) {
      const now = new Date().toISOString();
      filteredData.created_at = now;
      filteredData.updated_at = now;
    }

    // Cast data types
    const castData = this.castData(filteredData);

    return await this.db.create<T>(this.config.tableName, castData);
  }

  public async findById(id: any): Promise<T | null> {
    const result = await this.db.findOne<T>(this.config.tableName, {
      [this.config.primaryKey]: id,
    });

    return result ? this.castModel(result) : null;
  }

  public async findOne(conditions: Partial<T>): Promise<T | null> {
    const result = await this.db.findOne<T>(this.config.tableName, conditions);
    return result ? this.castModel(result) : null;
  }

  public async findMany(
    conditions: Partial<T> = {},
    options: {
      orderBy?: string;
      limit?: number;
      offset?: number;
      columns?: string[];
    } = {}
  ): Promise<T[]> {
    const result = await this.db.read<T>(this.config.tableName, conditions, options);
    
    if (result.success && result.data) {
      return result.data.map(item => this.castModel(item));
    }
    
    return [];
  }

  public async update(id: any, data: Partial<T>): Promise<QueryResult<T>> {
    // Validate input data
    const validation = this.validate(data);
    if (!validation.valid) {
      return {
        success: false,
        error: `Validation failed: ${validation.errors.join(', ')}`,
      };
    }

    // Filter only fillable fields
    const filteredData = this.filterFillable(data);
    
    // Add updated timestamp
    if (this.config.timestamps) {
      filteredData.updated_at = new Date().toISOString();
    }

    // Cast data types
    const castData = this.castData(filteredData);

    return await this.db.update<T>(
      this.config.tableName,
      castData,
      { [this.config.primaryKey]: id }
    );
  }

  public async delete(id: any): Promise<QueryResult<T>> {
    return await this.db.delete<T>(this.config.tableName, {
      [this.config.primaryKey]: id,
    });
  }

  public async deleteWhere(conditions: Partial<T>): Promise<QueryResult<T>> {
    return await this.db.delete<T>(this.config.tableName, conditions);
  }

  // ===========================
  // Query Methods
  // ===========================

  public async exists(conditions: Partial<T>): Promise<boolean> {
    return await this.db.exists(this.config.tableName, conditions);
  }

  public async count(conditions: Partial<T> = {}): Promise<number> {
    return await this.db.count(this.config.tableName, conditions);
  }

  public async paginate(
    conditions: Partial<T> = {},
    page: number = 1,
    perPage: number = 15,
    orderBy: string = `${this.config.primaryKey} DESC`
  ): Promise<{
    data: T[];
    pagination: {
      current: number;
      perPage: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const offset = (page - 1) * perPage;
    const total = await this.count(conditions);
    const pages = Math.ceil(total / perPage);

    const data = await this.findMany(conditions, {
      orderBy,
      limit: perPage,
      offset,
    });

    return {
      data,
      pagination: {
        current: page,
        perPage,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    };
  }

  // ===========================
  // Raw Query Methods
  // ===========================

  public async query<R = T>(sql: string, params: any[] = []): Promise<QueryResult<R>> {
    return await this.db.query<R>(sql, params);
  }

  public async execute(sql: string, params: any[] = []): Promise<QueryResult> {
    return await this.db.execute(sql, params);
  }

  // ===========================
  // Utility Methods
  // ===========================

  protected filterFillable(data: Partial<T>): Partial<T> {
    if (this.fillable.length === 0) {
      return data; // If no fillable defined, allow all
    }

    const filtered: Partial<T> = {};
    for (const key of this.fillable) {
      if (key in data) {
        filtered[key as keyof T] = data[key as keyof T];
      }
    }
    return filtered;
  }

  protected hideFields(data: T): Partial<T> {
    const result = { ...data };
    for (const field of this.hidden) {
      delete result[field as keyof T];
    }
    return result;
  }

  protected castData(data: Partial<T>): Partial<T> {
    const result = { ...data };
    
    for (const [field, type] of Object.entries(this.casts)) {
      if (field in result && result[field as keyof T] !== undefined) {
        const value = result[field as keyof T];
        
        switch (type) {
          case 'json':
            if (typeof value === 'object') {
              result[field as keyof T] = JSON.stringify(value) as any;
            }
            break;
          case 'boolean':
            result[field as keyof T] = Boolean(value) as any;
            break;
          case 'integer':
            result[field as keyof T] = parseInt(String(value), 10) as any;
            break;
          case 'float':
            result[field as keyof T] = parseFloat(String(value)) as any;
            break;
          case 'string':
            result[field as keyof T] = String(value) as any;
            break;
        }
      }
    }
    
    return result;
  }

  protected castModel(data: T): T {
    const result = { ...data };
    
    for (const [field, type] of Object.entries(this.casts)) {
      if (field in result && result[field as keyof T] !== undefined) {
        const value = result[field as keyof T];
        
        switch (type) {
          case 'json':
            try {
              if (typeof value === 'string') {
                result[field as keyof T] = JSON.parse(value) as any;
              }
            } catch {
              // If JSON parsing fails, keep as string
            }
            break;
          case 'boolean':
            result[field as keyof T] = Boolean(value) as any;
            break;
          case 'integer':
            result[field as keyof T] = parseInt(String(value), 10) as any;
            break;
          case 'float':
            result[field as keyof T] = parseFloat(String(value)) as any;
            break;
        }
      }
    }
    
    return result;
  }

  // ===========================
  // Relationship Methods
  // ===========================

  public async hasMany<R>(
    relatedModel: BaseModel<R>,
    foreignKey: string,
    localKey: string = this.config.primaryKey
  ): Promise<(data: T) => Promise<R[]>> {
    return async (data: T) => {
      const localValue = data[localKey as keyof T];
      return await relatedModel.findMany({ [foreignKey]: localValue } as any);
    };
  }

  public async belongsTo<R>(
    relatedModel: BaseModel<R>,
    foreignKey: string,
    ownerKey: string = relatedModel.config.primaryKey
  ): Promise<(data: T) => Promise<R | null>> {
    return async (data: T) => {
      const foreignValue = data[foreignKey as keyof T];
      return await relatedModel.findOne({ [ownerKey]: foreignValue } as any);
    };
  }

  // ===========================
  // Bulk Operations
  // ===========================

  public async bulkCreate(dataArray: Partial<T>[]): Promise<QueryResult[]> {
    const results: QueryResult[] = [];
    
    for (const data of dataArray) {
      const result = await this.create(data);
      results.push(result);
      
      if (!result.success) {
        break; // Stop on first error
      }
    }
    
    return results;
  }

  public async bulkUpdate(
    conditions: Partial<T>,
    data: Partial<T>
  ): Promise<QueryResult<T>> {
    // Filter only fillable fields
    const filteredData = this.filterFillable(data);
    
    // Add updated timestamp
    if (this.config.timestamps) {
      filteredData.updated_at = new Date().toISOString();
    }

    // Cast data types
    const castData = this.castData(filteredData);

    return await this.db.update<T>(this.config.tableName, castData, conditions);
  }

  // ===========================
  // Scopes (Query Builders)
  // ===========================

  public createScope(name: string, callback: (query: any) => any): void {
    // Implementation for query scopes
    // This can be extended based on specific needs
  }

  // ===========================
  // Events & Hooks
  // ===========================

  protected async beforeCreate(data: Partial<T>): Promise<Partial<T>> {
    return data;
  }

  protected async afterCreate(data: T): Promise<void> {
    // Override in child classes for post-creation logic
  }

  protected async beforeUpdate(id: any, data: Partial<T>): Promise<Partial<T>> {
    return data;
  }

  protected async afterUpdate(id: any, data: T): Promise<void> {
    // Override in child classes for post-update logic
  }

  protected async beforeDelete(id: any): Promise<boolean> {
    return true; // Return false to prevent deletion
  }

  protected async afterDelete(id: any): Promise<void> {
    // Override in child classes for post-deletion logic
  }
}