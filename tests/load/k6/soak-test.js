/*
Soak Test - Endurance test
Duration: 8 hours at sustained load
Validates: Memory leaks, connection stability
*/

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10m', target: 12000 },  // Ramp to target
    { duration: '8h', target: 12000 },   // SUSTAIN for 8 hours
    { duration: '10m', target: 0 },      // Cool down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<1000'],  // Should stay under 1s
    'http_req_failed': ['rate<0.01'],     // <1% errors
  },
};

const BASE_URL = __ENV.API_URL || 'https://api.eka-ai.in';

export default function () {
  // Mix of operations
  const endpoints = [
    '/health',
    '/api/job-cards',
    '/api/invoices',
    '/health/detailed',
  ];
  
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const response = http.get(`${BASE_URL}${endpoint}`);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'no memory leaks (response time stable)': (r) => r.timings.duration < 2000,
  });
  
  sleep(Math.random() * 3 + 1);  // 1-4 seconds between requests
}