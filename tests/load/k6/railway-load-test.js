/*
Load Test for Railway Deployment - 200K Users
Tests: 12,000 concurrent users, 500 QPS peak
Usage: k6 run railway-load-test.js
*/

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');

// Test configuration for 200K users
export const options = {
  stages: [
    { duration: '5m', target: 1000 },     // Ramp up: 1K users
    { duration: '10m', target: 5000 },    // Ramp up: 5K users
    { duration: '10m', target: 12000 },   // Ramp up: 12K concurrent (target)
    { duration: '20m', target: 12000 },   // Sustain: 12K for 20 min
    { duration: '5m', target: 5000 },     // Ramp down
    { duration: '5m', target: 0 },        // Cool down
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500', 'p(99)<1000'],  // 95% under 500ms
    'http_req_failed': ['rate<0.01'],                   // <1% errors
    'errors': ['rate<0.05'],
  },
};

const BASE_URL = __ENV.API_URL || 'https://api.eka-ai.in';

export default function () {
  group('Core API Flow', function () {
    // 1. Health check (every user)
    let healthRes = http.get(`${BASE_URL}/health`);
    check(healthRes, {
      'health status 200': (r) => r.status === 200,
      'health response time < 200ms': (r) => r.timings.duration < 200,
    });
    errorRate.add(healthRes.status !== 200);
    apiDuration.add(healthRes.timings.duration);
    
    sleep(1);
    
    // 2. Detailed health (10% of users)
    if (Math.random() < 0.1) {
      let detailedRes = http.get(`${BASE_URL}/health/detailed`);
      check(detailedRes, {
        'detailed health returns data': (r) => r.status === 200,
      });
      errorRate.add(detailedRes.status !== 200);
      sleep(2);
    }
    
    // 3. API endpoints (based on user behavior)
    // Read operations (70% of traffic)
    if (Math.random() < 0.7) {
      let jobsRes = http.get(`${BASE_URL}/api/job-cards`);
      check(jobsRes, {
        'GET /api/job-cards 200': (r) => r.status === 200,
      });
      errorRate.add(jobsRes.status !== 200);
      apiDuration.add(jobsRes.timings.duration);
      sleep(2);
    }
    
    // Write operations (30% of traffic)
    if (Math.random() < 0.3) {
      let payload = JSON.stringify({
        customer_name: `Customer ${__VU}`,
        vehicle_registration: `MH${String(__VU % 100).padStart(2, '0')}AB${1000 + __VU}`,
        status: 'Pending'
      });
      
      let createRes = http.post(`${BASE_URL}/api/job-cards`, payload, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      check(createRes, {
        'POST /api/job-cards 201': (r) => r.status === 201,
      });
      errorRate.add(createRes.status !== 201);
      apiDuration.add(createRes.timings.duration);
      sleep(3);
    }
  });
}