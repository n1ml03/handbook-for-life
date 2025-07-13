#!/usr/bin/env node
/**
 * Network Validation and Testing Module
 * 
 * Validates network configuration and tests connectivity between
 * frontend and backend services.
 */

import { spawn } from 'child_process';

/**
 * Network connectivity tester
 */
export class NetworkValidator {
  constructor(networkConfig) {
    this.networkConfig = networkConfig;
    this.testResults = {
      backendAccessible: false,
      frontendAccessible: false,
      corsConfigured: false,
      proxyWorking: false,
      firewallOpen: false
    };
  }

  /**
   * Test if a URL is accessible
   */
  async testUrlAccessibility(url, timeout = 5000) {
    try {
      const result = await this.executeCommand(`curl -s --max-time 5 --connect-timeout 3 "${url}"`, timeout);
      return {
        accessible: result.exitCode === 0,
        response: result.stdout,
        error: result.stderr
      };
    } catch (error) {
      return {
        accessible: false,
        response: null,
        error: error.message
      };
    }
  }

  /**
   * Test CORS configuration
   */
  async testCORS(backendUrl, frontendOrigin) {
    try {
      const corsTestUrl = `${backendUrl}/api/health`;
      const command = `curl -s -H "Origin: ${frontendOrigin}" -H "Access-Control-Request-Method: GET" -X OPTIONS "${corsTestUrl}" -I`;
      
      const result = await this.executeCommand(command, 5000);
      
      if (result.exitCode === 0) {
        const headers = result.stdout.toLowerCase();
        return {
          configured: headers.includes('access-control-allow-origin'),
          allowsOrigin: headers.includes(frontendOrigin.toLowerCase()) || headers.includes('*'),
          headers: result.stdout
        };
      }
      
      return { configured: false, allowsOrigin: false, error: result.stderr };
    } catch (error) {
      return { configured: false, allowsOrigin: false, error: error.message };
    }
  }

  /**
   * Execute shell command with timeout
   */
  async executeCommand(command, timeout = 10000) {
    return new Promise((resolve) => {
      const child = spawn('sh', ['-c', command], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      const timer = setTimeout(() => {
        timedOut = true;
        child.kill('SIGKILL');
      }, timeout);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      child.on('close', (code) => {
        clearTimeout(timer);
        resolve({
          exitCode: timedOut ? -1 : code,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          timedOut
        });
      });

      child.on('error', (error) => {
        clearTimeout(timer);
        resolve({
          exitCode: -1,
          stdout: '',
          stderr: error.message,
          timedOut: false
        });
      });
    });
  }

  /**
   * Run comprehensive network validation
   */
  async validateNetworkSetup() {
    console.log('\n🔍 Running Network Validation Tests');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const { networkIP, accessUrls } = this.networkConfig;
    const frontendOrigin = `http://${networkIP}:3000`;
    
    // Test 1: Backend accessibility
    console.log('🧪 Testing backend accessibility...');
    const backendTest = await this.testUrlAccessibility(`${accessUrls.backend}/api/health`);
    this.testResults.backendAccessible = backendTest.accessible;
    
    if (backendTest.accessible) {
      console.log('   ✅ Backend is accessible');
    } else {
      console.log('   ❌ Backend is not accessible');
      console.log(`      Error: ${backendTest.error}`);
    }

    // Test 2: Frontend accessibility
    console.log('🧪 Testing frontend accessibility...');
    const frontendTest = await this.testUrlAccessibility(accessUrls.frontend);
    this.testResults.frontendAccessible = frontendTest.accessible;
    
    if (frontendTest.accessible) {
      console.log('   ✅ Frontend is accessible');
    } else {
      console.log('   ❌ Frontend is not accessible');
      console.log(`      Error: ${frontendTest.error}`);
    }

    // Test 3: CORS configuration
    if (this.testResults.backendAccessible) {
      console.log('🧪 Testing CORS configuration...');
      const corsTest = await this.testCORS(accessUrls.backend, frontendOrigin);
      this.testResults.corsConfigured = corsTest.configured && corsTest.allowsOrigin;
      
      if (this.testResults.corsConfigured) {
        console.log('   ✅ CORS is properly configured');
      } else {
        console.log('   ❌ CORS configuration issue detected');
        if (!corsTest.configured) {
          console.log('      - CORS headers not found');
        }
        if (!corsTest.allowsOrigin) {
          console.log(`      - Origin ${frontendOrigin} not allowed`);
        }
      }
    }

    return this.generateValidationReport();
  }

  /**
   * Generate validation report
   */
  generateValidationReport() {
    const passedTests = Object.values(this.testResults).filter(Boolean).length;
    const totalTests = Object.keys(this.testResults).length;
    const allPassed = passedTests === totalTests;

    const report = {
      success: allPassed,
      passedTests,
      totalTests,
      results: this.testResults,
      recommendations: this.generateRecommendations()
    };

    console.log('\n📊 Validation Report');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Tests Passed: ${passedTests}/${totalTests}`);
    
    if (allPassed) {
      console.log('🎉 All tests passed! Network setup is working correctly.');
    } else {
      console.log('⚠️  Some tests failed. See recommendations below.');
    }

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }

    return report;
  }

  /**
   * Generate troubleshooting recommendations
   */
  generateRecommendations() {
    const recommendations = [];

    if (!this.testResults.backendAccessible) {
      recommendations.push('Start the backend server: cd backend && bun run dev');
      recommendations.push('Check if backend is binding to 0.0.0.0 (not localhost)');
      recommendations.push('Verify backend .env has HOST=0.0.0.0');
    }

    if (!this.testResults.frontendAccessible) {
      recommendations.push('Start the frontend server: cd frontend && bun run dev');
      recommendations.push('Ensure Vite is started with --host flag');
      recommendations.push('Check if frontend port 3000 is available');
    }

    if (!this.testResults.corsConfigured) {
      recommendations.push('Update backend CORS_ORIGINS to include frontend network URL');
      recommendations.push('Restart backend server after CORS configuration changes');
      recommendations.push('Verify frontend origin matches CORS configuration exactly');
    }

    if (recommendations.length === 0) {
      recommendations.push('Network setup appears to be working correctly');
      recommendations.push('Try accessing the applications from another device on the network');
    }

    return recommendations;
  }

  /**
   * Quick connectivity test
   */
  async quickTest() {
    const { networkIP } = this.networkConfig;
    
    console.log(`🔍 Quick connectivity test for ${networkIP}`);
    
    const backendTest = await this.testUrlAccessibility(`http://${networkIP}:3001/api/health`);
    const frontendTest = await this.testUrlAccessibility(`http://${networkIP}:3000`);
    
    console.log(`Backend (3001): ${backendTest.accessible ? '✅' : '❌'}`);
    console.log(`Frontend (3000): ${frontendTest.accessible ? '✅' : '❌'}`);
    
    return {
      backend: backendTest.accessible,
      frontend: frontendTest.accessible
    };
  }
}

export default NetworkValidator;
