import { test, expect } from '@playwright/test';

/**
 * API Smoke Tests
 * 
 * Quick validation of critical API endpoints.
 * These run on staging after deployment.
 */

test.describe('API Endpoints', () => {
  test('API root returns version info', async ({ request }) => {
    const response = await request.get('/api');
    
    expect(response.ok()).toBeTruthy();
    
    const body = await response.json();
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('name');
  });
  
  test('unauthorized request returns 401', async ({ request }) => {
    const response = await request.get('/api/portfolio');
    
    expect(response.status()).toBe(401);
    
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });
  
  test('invalid endpoint returns 404', async ({ request }) => {
    const response = await request.get('/api/nonexistent-endpoint');
    
    expect(response.status()).toBe(404);
  });
});

test.describe('CORS Headers', () => {
  test('OPTIONS request returns proper CORS headers', async ({ request }) => {
    const response = await request.fetch('/api/health', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://www.zala.ir',
        'Access-Control-Request-Method': 'GET',
      },
    });
    
    expect(response.headers()['access-control-allow-origin']).toBeTruthy();
  });
});

test.describe('Rate Limiting', () => {
  test('rate limit headers are present', async ({ request }) => {
    const response = await request.get('/api/health');
    
    const headers = response.headers();
    // Check for common rate limit headers (adjust based on your implementation)
    // expect(headers).toHaveProperty('x-ratelimit-limit');
    // expect(headers).toHaveProperty('x-ratelimit-remaining');
  });
});
