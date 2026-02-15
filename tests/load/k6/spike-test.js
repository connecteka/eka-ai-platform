/*
Spike Test - Sudden traffic surge
Simulates: Viral moment or marketing campaign
*/

import http from 'k6/http';
import { check } from 'k6';

export const options = {
  stages: [
    { duration: '2m', target: 100 },     // Baseline
    { duration: '30s', target: 20000 },  // SPIKE! 20K users in 30s
    { duration: '5m', target: 20000 },   // Stay at peak
    { duration: '2m', target: 100 },     // Recovery
  ],
  thresholds: {
    'http_req_duration': ['p(95)<2000'],  // Allow 2s during spike
    'http_req_failed': ['rate<0.05'],     // <5% errors acceptable
  },
};

const BASE_URL = __ENV.API_URL || 'https://api.eka-ai.in';

export default function () {
  const response = http.get(`${BASE_URL}/health`);
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 5s': (r) => r.timings.duration < 5000,
  });
}