import http from 'k6/http';
import { check } from 'k6';

export const options = {
  scenarios: {
    burst: {
      executor: 'constant-vus',
      vus: 100,
      duration: '15s',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1000'], // 95% below 1 second
    'http_reqs': ['rate>300'],         // At least 300 RPS
  },
};

export default function () {
  const headers = { 'X-Forwarded-For': '9.9.9.9' };
  const res = http.get('http://localhost:5000/api/health', { headers });
  
  check(res, { 
    '200/429 only': (r) => r.status === 200 || r.status === 429,
    'response time OK': (r) => r.timings.duration < 1000,
  });
}
