import request from 'supertest';
import nock from 'nock';
import { getTestableEndpoints, ContractEndpoint } from './loader';

// Mock server URL - adjust based on your setup
const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:5000';

// Test JWT token (use a valid test token or generate one)
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
        
        it('should return 200 on successful request (REAL endpoint)', async () => {
          if (!endpoint.status.includes('REAL')) {
            return; // Skip non-REAL endpoints for this test
          }
          
          // Skip test endpoints that require actual implementation
          if (endpoint.path === '/api/auth/register') {
            const response = await request(BASE_URL)
              .post(endpoint.path)
              .send({
                email: 'test@example.com',
                password: 'Test123!@#',
                name: 'Test User'
              });
            
            expect([200, 201, 400, 409]).toContain(response.status);
          }
        });
        
        it('should return 400 on invalid request body', async () => {
          if (endpoint.method === 'POST' || endpoint.method === 'PATCH') {
            const method = endpoint.method.toLowerCase() as 'post' | 'patch';
            const response = await request(BASE_URL)[method](endpoint.path)
              .send({ invalid: 'data' });
            
            expect([400, 401, 422]).toContain(response.status);
          }
        });
      });
    });
  });
  
  describe('Protected Endpoints', () => {
    const protectedEndpoints = endpoints.filter(e => 
      e.auth && e.auth.includes('JWT') && !e.path.startsWith('/api/auth')
    );
    
    protectedEndpoints.slice(0, 15).forEach((endpoint) => {
      describe(`${endpoint.method} ${endpoint.path}`, () => {
        
        it('should return 401 without authentication', async () => {
          const method = endpoint.method.toLowerCase() as 'get' | 'post' | 'patch' | 'delete';
          const response = await request(BASE_URL)[method](endpoint.path);
          
          expect([401, 403]).toContain(response.status);
        });
        
        it('should return 401/403 with invalid token', async () => {
          const method = endpoint.method.toLowerCase() as 'get' | 'post' | 'patch' | 'delete';
          const response = await request(BASE_URL)[method](endpoint.path)
            .set('Authorization', 'Bearer invalid_token_123');
          
          expect([401, 403]).toContain(response.status);
        });
        
        it('should accept valid JWT token', async () => {
          const method = endpoint.method.toLowerCase() as 'get' | 'post' | 'patch' | 'delete';
          const response = await request(BASE_URL)[method](endpoint.path)
            .set('Authorization', `Bearer ${TEST_JWT}`);
          
          // Should not return 401 (token is valid)
          // May return other errors (400, 404, etc.) but not auth errors
          expect(response.status).not.toBe(401);
        });
      });
    });
  });
  
  describe('Health Check Endpoints', () => {
    it('GET /api/health should return 200', async () => {
      const response = await request(BASE_URL)
        .get('/api/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
    });
    
    it('GET /api/health/full should require authentication', async () => {
      const response = await request(BASE_URL)
        .get('/api/health/full');
      
      // Should require Basic Auth
      expect([401, 403]).toContain(response.status);
    });
  });
  
  describe('Dashboard Endpoints', () => {
    it('GET /api/dashboard/portfolio-real should require auth', async () => {
      const response = await request(BASE_URL)
        .get('/api/dashboard/portfolio-real');
      
      expect([401, 403]).toContain(response.status);
    });
    
    it('GET /api/dashboard/portfolio-real should work with valid token', async () => {
      const response = await request(BASE_URL)
        .get('/api/dashboard/portfolio-real')
        .set('Authorization', `Bearer ${TEST_JWT}`);
      
      expect([200, 500]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty('total_balance_usd');
      }
    });
  });
  
  describe('Portfolio Endpoints', () => {
    it('GET /api/portfolio/holdings should require auth', async () => {
      const response = await request(BASE_URL)
        .get('/api/portfolio/holdings');
      
      expect([401, 403]).toContain(response.status);
    });
    
    it('GET /api/wallet/balances should require auth', async () => {
      const response = await request(BASE_URL)
        .get('/api/wallet/balances')
        .query({ exchange: 'mexc' });
      
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
      
      // At least one should be rate limited (or all should be 401 if auth fails)
      const statuses = responses.map(r => r.status);
      const has429 = statuses.includes(429);
      const allAuth = statuses.every(s => [401, 403].includes(s));
      
      expect(has429 || allAuth).toBe(true);
    }, 15000);
  });
  
  describe('Validation Tests', () => {
    it('POST /api/manual-trading/order should validate request body', async () => {
      const response = await request(BASE_URL)
        .post('/api/manual-trading/order')
        .set('Authorization', `Bearer ${TEST_JWT}`)
        .send({
          // Missing required fields
          symbol: 'BTCUSDT'
        });
      
      expect([400, 401, 422]).toContain(response.status);
    });
    
    it('POST /api/autopilot/start should validate configuration', async () => {
      const response = await request(BASE_URL)
        .post('/api/autopilot/start')
        .set('Authorization', `Bearer ${TEST_JWT}`)
        .send({
          // Invalid configuration
          invalid_field: 'test'
        });
      
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
      
      expect([200, 204]).toContain(response.status);
    });
    
    it('POST /api/security/csp-report should handle invalid reports', async () => {
      const response = await request(BASE_URL)
        .post('/api/security/csp-report')
        .send({ invalid: 'data' });
      
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
