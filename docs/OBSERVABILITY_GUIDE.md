# Observability Guide

This guide explains how to implement observability (logging, tracing, metrics) in your Hono application.

## Quick Start

### Basic Setup (Structured Logging + Request IDs)

```typescript
import { Hono } from 'hono';
import { 
  withRequestId, 
  requestLogger, 
  errorLogger,
  getLogger 
} from './middleware/observability';

const app = new Hono();

// 1. Add request ID tracking (correlation IDs)
app.use('*', withRequestId);

// 2. Add error logging (catches unhandled errors)
app.use('*', errorLogger);

// 3. Add request/response logging
app.use('*', requestLogger);

// Use logger in your routes
app.get('/example', (c) => {
  const logger = getLogger(c);
  logger.info('Processing example request');
  
  return c.json({ success: true });
});

export default app;
```

## Features

### 1. Request ID Tracking (Correlation IDs)

Every request gets a unique ID for tracing across services.

```typescript
// Automatically added by withRequestId middleware
// Access in handlers:
const reqId = c.get('reqId');

// Also included in response headers:
// X-Request-ID: AbC123xyz...
```

**Benefits:**
- Trace requests across multiple services
- Correlate logs from different sources
- Debug distributed transactions
- Support for load balancer X-Request-ID headers

### 2. Structured JSON Logging

All logs are output as JSON for easy parsing by log aggregators (ELK, Splunk, CloudWatch).

```typescript
import { getLogger } from './middleware/observability';

app.get('/users/:id', async (c) => {
  const logger = getLogger(c);
  const userId = c.req.param('id');
  
  // Log with context
  logger.info('Fetching user', { userId });
  
  try {
    const user = await db.getUser(userId);
    logger.info('User fetched successfully', { userId, username: user.name });
    return c.json(user);
  } catch (error) {
    logger.error('Failed to fetch user', error, { userId });
    return c.json({ error: 'User not found' }, 404);
  }
});
```

**Log Output:**
```json
{
  "timestamp": "2025-11-01T15:45:23.123Z",
  "level": "info",
  "reqId": "AbC123xyz...",
  "message": "Fetching user",
  "userId": "123"
}
```

### 3. Automatic Request/Response Logging

Every request is logged with:
- Method, path
- Status code
- Response time (ms)
- Request ID

```json
{
  "timestamp": "2025-11-01T15:45:23.456Z",
  "level": "info",
  "reqId": "AbC123xyz...",
  "message": "Request completed",
  "method": "GET",
  "path": "/api/users/123",
  "status": 200,
  "duration": 45
}
```

### 4. Error Logging with Stack Traces

Unhandled errors are caught and logged with full context:

```json
{
  "timestamp": "2025-11-01T15:45:23.789Z",
  "level": "error",
  "reqId": "AbC123xyz...",
  "message": "Unhandled error in request",
  "method": "POST",
  "path": "/api/orders",
  "error": {
    "name": "DatabaseError",
    "message": "Connection timeout",
    "stack": "DatabaseError: Connection timeout\n    at ..."
  }
}
```

## Log Levels

| Level | Usage | Example |
|-------|-------|---------|
| `debug` | Detailed debugging info | Variable values, function entry/exit |
| `info` | Normal operations | Request completed, task started |
| `warn` | Warning conditions | Deprecated API used, rate limit close |
| `error` | Error conditions | Exception caught, external service down |

## Child Loggers (Context Inheritance)

Create loggers with inherited context:

```typescript
const logger = getLogger(c);

// Create child logger with user context
const userLogger = logger.child({ userId: '123', role: 'admin' });

userLogger.info('Action performed'); 
// Output includes userId and role automatically
```

## Integration with Log Aggregators

### ELK Stack (Elasticsearch, Logstash, Kibana)

**PM2 Logs to Logstash:**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'titan-backend',
    script: './server-real-v3.js',
    error_file: '/var/log/titan/error.log',
    out_file: '/var/log/titan/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
  }]
};
```

**Logstash Config:**
```conf
input {
  file {
    path => "/var/log/titan/*.log"
    codec => json
  }
}

filter {
  json {
    source => "message"
  }
}

output {
  elasticsearch {
    hosts => ["localhost:9200"]
    index => "titan-logs-%{+YYYY.MM.dd}"
  }
}
```

### CloudWatch Logs (AWS)

**Send logs to CloudWatch:**
```bash
# Install CloudWatch agent
sudo npm install -g cloudwatch-logs-stream

# Stream logs
cloudwatch-logs-stream \
  --log-group-name /aws/titan/production \
  --log-stream-name $(hostname) \
  /var/log/titan/out.log
```

### Prometheus Metrics (Future Enhancement)

Add metrics endpoint:

```typescript
import { Counter, Histogram } from 'prom-client';

const requestCounter = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'path', 'status']
});

const requestDuration = new Histogram({
  name: 'http_request_duration_ms',
  help: 'HTTP request duration',
  labelNames: ['method', 'path']
});

// In request logger:
requestCounter.inc({ method, path, status });
requestDuration.observe({ method, path }, duration);

// Metrics endpoint:
app.get('/metrics', async (c) => {
  const metrics = await register.metrics();
  return c.text(metrics);
});
```

## Alerting (Future Enhancement)

### Basic Alerts

Monitor logs for error patterns:

```bash
# Alert on high error rate
tail -f /var/log/titan/out.log | grep '"level":"error"' | \
  while read line; do
    echo "ERROR DETECTED: $line" | mail -s "Titan Error Alert" admin@example.com
  done
```

### Advanced Alerting (Prometheus + Alertmanager)

```yaml
# prometheus-alerts.yml
groups:
  - name: titan-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        annotations:
          summary: "High error rate detected"
```

## Performance Considerations

### Log Sampling (High Traffic)

For high-traffic endpoints, sample logs:

```typescript
app.use('/api/health', async (c, next) => {
  // Only log 1% of health checks
  if (Math.random() > 0.01) {
    c.set('skipLogging', true);
  }
  await next();
});

// In requestLogger:
if (c.get('skipLogging')) return next();
```

### Async Logging (Non-blocking)

Use async log transport to avoid blocking:

```typescript
// Future: Use pino or winston for async logging
import pino from 'pino';

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty', // Development
    // target: 'pino-elasticsearch', // Production
  }
});
```

## Environment-Specific Logging

```typescript
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// Only log debug in development
if (process.env.NODE_ENV === 'production') {
  logger.debug = () => {}; // No-op
}
```

## Verification

After deploying:

```bash
# Check logs are JSON formatted
pm2 logs titan-backend --json

# Search logs by request ID
pm2 logs titan-backend | grep "AbC123xyz..."

# Count errors in last hour
pm2 logs titan-backend --lines 10000 | grep '"level":"error"' | wc -l

# Monitor real-time errors
pm2 logs titan-backend | grep --color=always '"level":"error"'
```

## Best Practices

✅ **DO:**
- Use structured JSON logging
- Include correlation IDs
- Log at appropriate levels
- Add contextual metadata
- Sanitize sensitive data (passwords, tokens)

❌ **DON'T:**
- Log passwords or tokens
- Use console.log() directly (use logger)
- Log at debug level in production
- Include PII without redaction
- Block I/O with synchronous logging

## Related

- Structured Logging: https://www.structlog.org/
- 12-Factor App Logs: https://12factor.net/logs
- OpenTelemetry: https://opentelemetry.io/
