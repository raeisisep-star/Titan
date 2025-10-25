import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

export interface ContractEndpoint {
  path: string;
  method: string;
  auth?: string;
  rate_limit?: string;
  status: string;
  description?: string;
  request?: {
    headers?: Record<string, string>;
    body?: any;
    params?: Record<string, string>;
  };
  response?: {
    [key: number]: {
      schema?: any;
      description?: string;
    };
  };
}

export interface ContractModule {
  description: string;
  endpoints: ContractEndpoint[];
}

export interface ContractsYAML {
  [moduleName: string]: ContractModule;
}

/**
 * Load and parse contracts.yml
 */
export function loadContracts(): ContractsYAML {
  // Try simple contracts first, fallback to full contracts.yml
  let contractsPath = path.join(__dirname, '../../docs/contracts/contracts-simple.yml');
  if (!fs.existsSync(contractsPath)) {
    contractsPath = path.join(__dirname, '../../docs/contracts/contracts.yml');
  }
  
  if (!fs.existsSync(contractsPath)) {
    throw new Error(`Contracts file not found at: ${contractsPath}`);
  }
  
  const fileContent = fs.readFileSync(contractsPath, 'utf8');
  
  try {
    const contracts = yaml.parse(fileContent);
    return contracts;
  } catch (error: any) {
    console.error('YAML Parse Error:', error.message);
    console.error('Line:', error.linePos);
    throw new Error(`Failed to parse contracts.yml: ${error.message}`);
  }
}

/**
 * Get all endpoints with REAL or PARTIAL status
 */
export function getTestableEndpoints(): ContractEndpoint[] {
  const contracts = loadContracts();
  const endpoints: ContractEndpoint[] = [];
  
  for (const moduleName in contracts) {
    const module = contracts[moduleName];
    
    // Skip metadata sections
    if (moduleName === 'gap_analysis' || moduleName === 'notes') {
      continue;
    }
    
    if (module.endpoints && Array.isArray(module.endpoints)) {
      for (const endpoint of module.endpoints) {
        // Only test REAL and PARTIAL endpoints
        if (endpoint.status && (
          endpoint.status.includes('REAL') || 
          endpoint.status.includes('PARTIAL')
        )) {
          endpoints.push(endpoint);
        }
      }
    }
  }
  
  return endpoints;
}

/**
 * Filter endpoints by status
 */
export function filterEndpointsByStatus(status: 'REAL' | 'PARTIAL' | 'TODO'): ContractEndpoint[] {
  const contracts = loadContracts();
  const endpoints: ContractEndpoint[] = [];
  
  for (const moduleName in contracts) {
    const module = contracts[moduleName];
    
    if (moduleName === 'gap_analysis' || moduleName === 'notes') {
      continue;
    }
    
    if (module.endpoints && Array.isArray(module.endpoints)) {
      for (const endpoint of module.endpoints) {
        if (endpoint.status && endpoint.status.includes(status)) {
          endpoints.push(endpoint);
        }
      }
    }
  }
  
  return endpoints;
}

/**
 * Get endpoint by path and method
 */
export function findEndpoint(path: string, method: string): ContractEndpoint | undefined {
  const endpoints = getTestableEndpoints();
  return endpoints.find(e => e.path === path && e.method === method);
}
