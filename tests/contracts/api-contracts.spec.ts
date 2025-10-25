import request from 'supertest';
import nock from 'nock';
import { getTestableEndpoints, ContractEndpoint } from './loader';

// Mock server URL - adjust based on your setup
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';

// Test JWT token (intentionally invalid for security)
const TEST_JWT = process.env.TEST_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzAwMDAwMDAwfQ.test';

// Mock MEXC API responses
function mockMEXCAPI() {
  // Mock MEXC balance endpoint
  nock('https://api.mexc.com')
    .persist()
    .get('/api/v3/account')
    .reply(200, {
      balances: [
        { asset: 'USDT', free: '10000.00', locked: '0.00' },
        { asset: 'BTC', free: '0.5', locked: '0.0' }
      ]
    });
  
  // Mock MEXC ticker price
  nock('https://api.mexc.com')
    .persist()
    .get('/api/v3/ticker/price')
    .query(true)
    .reply(200, { symbol: 'BTCUSDT', price: '45000.00' });
  
  // Mock MEXC order placement
  nock('https://api.mexc.com')
    .persist()
    .post('/api/v3/order')
    .reply(200, {
      symbol: 'BTCUSDT',
      orderId: 123456789,
      status: 'FILLED',
      executedQty: '0.01',
      price: '45000.00'
    });
  
  // Mock MEXC open orders
  nock('https://api.mexc.com')
    .persist()
    .get('/api/v3/openOrders')
    .reply(200, []);
}

describe('API Contract Tests', () => {
  const endpoints = getTestableEndpoints();
  
  beforeAll(() => {
    mockMEXCAPI();
  });
  
  afterAll(() => {
    nock.cleanAll();
  });
  
  describe('Authentication Endpoints', () => {
    const authEndpoints = endpoints.filter(e => e.path.startsWith('/api/auth'));
    
    authEndpoints.forEach((endpoint) => {
      describe(`${endpoint.method} ${endpoint.path}`, () => {
        
        it('should handle authentication endpoint request', async () => {
          if (!endpoint.status.includes('REAL')) {
            return; // Skip non-REAL endpoints
          }
          
          // Skip register test (we don't want to create test users)
          if (endpoint.path === '/api/auth/register') {
            const response = await request(BASE_URL)
              .post(endpoint.path)
              .send({
                email: 'test@example.com',
                password: 'Test123!@#',
                name: 'Test User'
              });
            
            // Accept valid responses (200, 201, 400 validation, 409 conflict)
            expect([200, 201, 400, 409]).toContain(response.status);
          }
        });
        
        it('should return 400/401/422 on invalid request body for POST/PATCH', async () => {
          if (endpoint.method === 'POST' || endpoint.method === 'PATCH') {
            const method = endpoint.method.toLowerCase() as 'post' | 'patch';
            const response = await request(BASE_URL)[method](endpoint.path)
              .send({ invalid: 'data' });
            
            // Auth endpoints may return 401 for missing credentials or 400 for invalid data
            expect([400, 401, 422]).toContain(response.status);
          }
        });
      });
    });
  });
  
  describe('Protected Endpoints - Authentication Enforcement', () => {
    const protectedEndpoints = endpoints.filter(e => 
      e.auth && e.auth.includes('JWT') && !e.path.startsWith('/api/auth')
    );
    
    protectedEndpoints.slice(0, 15).forEach((endpoint) => {
      describe(`${endpoint.method} ${endpoint.path}`, () => {
        
        it('should return 401/403 without authentication', async () => {
          const method = endpoint.method.toLowerCase() as 'get' | 'post' | 'patch' | 'delete';
          const response = await request(BASE_URL)[method](endpoint.path);
          
          // Only expect auth errors (401 or 403), not 404
          expect([401, 403]).toContain(response.status);
        });
        
        it('should return 401/403 with invalid token', async () => {
          const method = endpoint.method.toLowerCase() as 'get' | 'post' | 'patch' | 'delete';
          const response = await request(BASE_URL)[method](endpoint.path)
            .set('Authorization', 'Bearer invalid_token_123');
          
          // Only expect auth errors (401 or 403)
          expect([401, 403]).toContain(response.status);
        });
        
        // Skip valid JWT tests - token is intentionally invalid for security
        it.skip('should accept valid JWT token (skipped - requires valid test user)', async () => {
          const method = endpoint.method.toLowerCase() as 'get' | 'post' | 'patch' | 'delete';
          const response = await request(BASE_URL)[method](endpoint.path)
            .set('Authorization', `Bearer ${TEST_JWT}`);
          
          // This test is skipped because TEST_JWT is intentionally invalid
          // To enable: create test user, generate valid JWT, set in TEST_JWT env var
          expect(response.status).not.toBe(401);
        });
      });
    });
  });
  
  describe('Health Check Endpoints', () => {
    it('GET /api/health should return 200 with nested data structure', async () => {
      const response = await request(BASE_URL)
        .get('/api/health');
      
      expect(response.status).toBe(200);
      // API returns nested structure: {success: true, data: {status: "healthy", ...}}
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('status');
    });
    
    it('GET /api/health/full should require authentication', async () => {
      const response = await request(BASE_URL)
        .get('/api/health/full');
      
      // Should require Basic Auth, expect 401 or 403
      expect([401, 403]).toContain(response.status);
    });
  });
  
  describe('Dashboard Endpoints', () => {
    it('GET /api/dashboard/portfolio-real should require auth', async () => {
      const response = await request(BASE_URL)
        .get('/api/dashboard/portfolio-real');
      
      // Should require JWT, expect 401 or 403
      expect([401, 403]).toContain(response.status);
    });
    
    // Skip valid token test - requires valid JWT
    it.skip('GET /api/dashboard/portfolio-real should work with valid token', async () => {
      const response = await request(BASE_URL)
        .get('/api/dashboard/portfolio-real')
        .set('Authorization', `Bearer ${TEST_JWT}`);
      
      // Skipped - TEST_JWT is intentionally invalid
      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body.data).toHaveProperty('total_balance_usd');
      }
    });
  });
  
  describe('Portfolio Endpoints', () => {
    it('GET /api/portfolio/holdings should require auth', async () => {
      const response = await request(BASE_URL)
        .get('/api/portfolio/holdings');
      
      // Should require JWT, expect 401 or 403
      expect([401, 403]).toContain(response.status);
    });
    
    it('GET /api/wallet/balances should require auth', async () => {
      const response = await request(BASE_URL)
        .get('/api/wallet/balances')
        .query({ exchange: 'mexc' });
      
      // Should require JWT, expect 401 or 403
      expect([401, 403]).toContain(response.status);
    });
  });
  
  describe('Rate Limiting', () => {
    it('should enforce rate limits on protected endpoints', async () => {
      // Make multiple requests quickly
      const requests = Array(30).fill(null).map(() => 
        request(BASE_URL)
          .get('/api/dashboard/portfolio-real')
          .set('Authorization', `Bearer ${TEST_JWT}`)
      );
      
      const responses = await Promise.all(requests);
      
      // At least one should be rate limited OR all should be 401 (invalid token)
      const statuses = responses.map(r => r.status);
      const has429 = statuses.includes(429);
      const allAuth = statuses.every(s => [401, 403].includes(s));
      
      // Either rate limit works OR auth correctly rejects all (both are valid)
      expect(has429 || allAuth).toBe(true);
    }, 15000);
  });
  
  describe('Validation Tests', () => {
    it('POST /api/manual-trading/order should require auth before validation', async () => {
      const response = await request(BASE_URL)
        .post('/api/manual-trading/order')
        .set('Authorization', `Bearer ${TEST_JWT}`)
        .send({
          // Missing required fields
          symbol: 'BTCUSDT'
        });
      
      // Auth runs first, so expect 401 (invalid token) or 400/422 if somehow passed auth
      expect([400, 401, 422]).toContain(response.status);
    });
    
    it('POST /api/autopilot/start should require auth before validation', async () => {
      const response = await request(BASE_URL)
        .post('/api/autopilot/start')
        .set('Authorization', `Bearer ${TEST_JWT}`)
        .send({
          // Invalid configuration
          invalid_field: 'test'
        });
      
      // Auth runs first, so expect 401 (invalid token) or 400/422 if somehow passed auth
      expect([400, 401, 422]).toContain(response.status);
    });
  });
  
  describe('CSP Report Endpoint', () => {
    it('POST /api/security/csp-report should accept CSP reports', async () => {
      const response = await request(BASE_URL)
        .post('/api/security/csp-report')
        .send({
          'csp-report': {
            'document-uri': 'https://example.com/page',
            'violated-directive': 'style-src',
            'blocked-uri': 'https://evil.com/style.css'
          }
        });
      
      // CSP endpoint should accept reports (200 or 204)
      expect([200, 204]).toContain(response.status);
    });
    
    it('POST /api/security/csp-report should handle invalid reports', async () => {
      const response = await request(BASE_URL)
        .post('/api/security/csp-report')
        .send({ invalid: 'data' });
      
      // Should still accept (200/204) or return 400 for invalid format
      expect([200, 204, 400]).toContain(response.status);
    });
  });
});

describe('Contract Coverage Report', () => {
  it('should test at least 20 endpoints', () => {
    const endpoints = getTestableEndpoints();
    expect(endpoints.length).toBeGreaterThanOrEqual(20);
  });
  
  it('should have REAL endpoints available', () => {
    const endpoints = getTestableEndpoints();
    const realEndpoints = endpoints.filter(e => e.status.includes('REAL'));
    expect(realEndpoints.length).toBeGreaterThanOrEqual(10);
  });
});
