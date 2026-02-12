#!/usr/bin/env node
/**
 * EKA-AI Testing Agent
 * Comprehensive testing and diagnostic tool for the deployed application
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const CONFIG = {
  baseUrl: 'https://eka-ai-c9d24.web.app',
  apiUrl: process.env.VITE_API_URL || 'https://named-dialect-486912-c7.el.r.appspot.com',
  timeout: 10000,
};

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log('cyan', `  ${title}`);
  console.log('='.repeat(60));
}

// HTTP Request helper
function request(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: CONFIG.timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({
        status: res.statusCode,
        headers: res.headers,
        data: data,
        url: url
      }));
    });
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

// Test Suite
const tests = {
  async checkHomepage() {
    logSection('1. HOMEPAGE CHECK');
    try {
      const res = await request(CONFIG.baseUrl);
      log('blue', `Status: ${res.status}`);
      
      if (res.status !== 200) {
        log('red', `❌ FAIL: Expected 200, got ${res.status}`);
        return false;
      }
      
      // Check for critical elements
      const checks = [
        { name: 'HTML DOCTYPE', test: () => res.data.includes('<!DOCTYPE html>') || res.data.includes('<html') },
        { name: 'Title tag', test: () => res.data.includes('<title') },
        { name: 'Root div', test: () => res.data.includes('id="root"') || res.data.includes('<div id="root"') },
        { name: 'Script tags', test: () => res.data.includes('<script') },
        { name: 'CSS loaded', test: () => res.data.includes('.css') || res.data.includes('<link') },
      ];
      
      let passed = 0;
      for (const check of checks) {
        if (check.test()) {
          log('green', `  ✅ ${check.name}`);
          passed++;
        } else {
          log('red', `  ❌ ${check.name} - MISSING`);
        }
      }
      
      log('blue', `\nPassed: ${passed}/${checks.length} checks`);
      return passed === checks.length;
    } catch (err) {
      log('red', `❌ ERROR: ${err.message}`);
      return false;
    }
  },

  async checkStaticAssets() {
    logSection('2. STATIC ASSETS CHECK');
    try {
      const res = await request(CONFIG.baseUrl);
      const html = res.data;
      
      // Extract JS and CSS files
      const jsFiles = [...html.matchAll(/src="([^"]+\.js)"/g)].map(m => m[1]);
      const cssFiles = [...html.matchAll(/href="([^"]+\.css)"/g)].map(m => m[1]);
      
      log('blue', `Found ${jsFiles.length} JS files, ${cssFiles.length} CSS files`);
      
      let allLoaded = true;
      
      // Test JS files
      for (const js of jsFiles) {
        const url = js.startsWith('http') ? js : `${CONFIG.baseUrl}${js}`;
        try {
          const jsRes = await request(url);
          if (jsRes.status === 200) {
            log('green', `  ✅ JS: ${js.substring(0, 50)}...`);
          } else {
            log('red', `  ❌ JS: ${js} - Status ${jsRes.status}`);
            allLoaded = false;
          }
        } catch (err) {
          log('red', `  ❌ JS: ${js} - ${err.message}`);
          allLoaded = false;
        }
      }
      
      // Test CSS files
      for (const css of cssFiles) {
        const url = css.startsWith('http') ? css : `${CONFIG.baseUrl}${css}`;
        try {
          const cssRes = await request(url);
          if (cssRes.status === 200) {
            log('green', `  ✅ CSS: ${css.substring(0, 50)}...`);
          } else {
            log('red', `  ❌ CSS: ${css} - Status ${cssRes.status}`);
            allLoaded = false;
          }
        } catch (err) {
          log('red', `  ❌ CSS: ${css} - ${err.message}`);
          allLoaded = false;
        }
      }
      
      return allLoaded;
    } catch (err) {
      log('red', `❌ ERROR: ${err.message}`);
      return false;
    }
  },

  async checkRoutes() {
    logSection('3. ROUTES CHECK');
    const routes = [
      '/',
      '/login',
      '/chat',
      '/job-cards',
      '/invoices',
      '/mg-fleet',
    ];
    
    let allPassed = true;
    
    for (const route of routes) {
      try {
        const res = await request(`${CONFIG.baseUrl}${route}`);
        if (res.status === 200) {
          log('green', `  ✅ ${route} - OK`);
        } else {
          log('red', `  ❌ ${route} - Status ${res.status}`);
          allPassed = false;
        }
      } catch (err) {
        log('red', `  ❌ ${route} - ${err.message}`);
        allPassed = false;
      }
    }
    
    return allPassed;
  },

  async checkApiConnection() {
    logSection('4. API CONNECTION CHECK');
    try {
      const res = await request(`${CONFIG.apiUrl}/api/health`);
      log('blue', `API Status: ${res.status}`);
      
      if (res.status === 200) {
        log('green', '  ✅ API is responding');
        return true;
      } else {
        log('yellow', `  ⚠️ API returned ${res.status} (may need backend deployment)`);
        return false;
      }
    } catch (err) {
      log('yellow', `  ⚠️ API not reachable: ${err.message}`);
      log('blue', '  ℹ️ Backend may need to be deployed to Cloud Run');
      return false;
    }
  },

  async checkEnvironment() {
    logSection('5. ENVIRONMENT CHECK');
    
    const checks = [
      { name: 'VITE_SUPABASE_URL', value: process.env.VITE_SUPABASE_URL },
      { name: 'VITE_SUPABASE_ANON_KEY', value: process.env.VITE_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Not set' },
      { name: 'VITE_API_URL', value: process.env.VITE_API_URL || CONFIG.apiUrl },
    ];
    
    for (const check of checks) {
      if (check.value) {
        log('green', `  ✅ ${check.name}: ${check.value}`);
      } else {
        log('red', `  ❌ ${check.name}: Not configured`);
      }
    }
    
    return true;
  },

  async checkBuildOutput() {
    logSection('6. LOCAL BUILD CHECK');
    const distPath = path.join(__dirname, '..', 'dist');
    
    if (!fs.existsSync(distPath)) {
      log('red', '  ❌ dist/ directory not found. Run: npm run build');
      return false;
    }
    
    const files = fs.readdirSync(distPath);
    log('blue', `  Files in dist/: ${files.join(', ')}`);
    
    const hasIndex = files.includes('index.html');
    const hasAssets = files.includes('assets') || files.some(f => f.endsWith('.js') || f.endsWith('.css'));
    
    if (hasIndex && hasAssets) {
      log('green', '  ✅ Build output looks correct');
      return true;
    } else {
      log('red', '  ❌ Build output incomplete');
      return false;
    }
  }
};

// Main runner
async function runTests() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║           EKA-AI TESTING AGENT v1.0                      ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`Testing: ${CONFIG.baseUrl}`);
  console.log(`Time: ${new Date().toISOString()}`);
  
  const results = {};
  
  for (const [name, testFn] of Object.entries(tests)) {
    results[name] = await testFn();
  }
  
  // Summary
  logSection('TEST SUMMARY');
  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r).length;
  
  for (const [name, result] of Object.entries(results)) {
    const icon = result ? '✅' : '❌';
    const color = result ? 'green' : 'red';
    log(color, `${icon} ${name}`);
  }
  
  console.log('\n' + '='.repeat(60));
  if (passed === total) {
    log('green', `🎉 ALL TESTS PASSED (${passed}/${total})`);
  } else {
    log('yellow', `⚠️  SOME TESTS FAILED (${passed}/${total} passed)`);
  }
  console.log('='.repeat(60));
  
  // Recommendations
  logSection('RECOMMENDATIONS');
  
  if (!results.checkHomepage) {
    log('yellow', '• Homepage is not loading correctly. Check Firebase deployment.');
  }
  
  if (!results.checkStaticAssets) {
    log('yellow', '• Some static assets are missing. Rebuild and redeploy.');
  }
  
  if (!results.checkApiConnection) {
    log('yellow', '• Backend API is not reachable. Deploy backend to Cloud Run.');
    log('blue', '  Command: gcloud run deploy eka-ai-backend --source ./backend');
  }
  
  if (!results.checkBuildOutput) {
    log('yellow', '• No local build found. Run: npm run build');
  }
  
  log('blue', '\nFor manual testing, visit:');
  log('blue', `  ${CONFIG.baseUrl}`);
}

// Run if executed directly
if (require.main === module) {
  runTests().catch(err => {
    log('red', `Fatal error: ${err.message}`);
    process.exit(1);
  });
}

module.exports = { tests, runTests };
