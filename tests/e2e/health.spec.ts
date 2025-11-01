import { test, expect } from '@playwright/test';

/**
 * Health Check Smoke Tests
 * 
 * These tests verify basic system health and availability.
 * Run on every deployment to staging.
 */

test.describe('Health Checks', () => {
  test('health endpoint returns 200 OK', async ({ request }) => {
    const response = await request.get('/health');
    
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.status).toBe('healthy');
  });
  
  test('health endpoint includes version info', async ({ request }) => {
    const response = await request.get('/health');
    const body = await response.json();
    
    expect(body).toHaveProperty('version');
    expect(body).toHaveProperty('timestamp');
    expect(body).toHaveProperty('environment');
  });
  
  test('health check responds within 1 second', async ({ request }) => {
    const start = Date.now();
    await request.get('/health');
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(1000);
  });
});

test.describe('Service Connectivity', () => {
  test('can connect to database', async ({ request }) => {
    const response = await request.get('/health');
    const body = await response.json();
    
    expect(body.services).toHaveProperty('database');
    expect(body.services.database).toBe('connected');
  });
  
  test('can connect to Redis', async ({ request }) => {
    const response = await request.get('/health');
    const body = await response.json();
    
    expect(body.services).toHaveProperty('redis');
    expect(body.services.redis).toBe('connected');
  });
});
