#!/usr/bin/env bun
/**
 * Unified Network Discovery Module
 * 
 * Shared network discovery functionality for both frontend and backend
 * applications to ensure consistent IP detection and configuration.
 */

import { networkInterfaces } from 'os';
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Network interface information
 */
export class NetworkInfo {
  constructor(interfaceName, address, family, internal) {
    this.interface = interfaceName;
    this.address = address;
    this.family = family;
    this.internal = internal;
  }

  /**
   * Check if this is a local network IP (private IP ranges)
   */
  isLocalNetwork() {
    if (this.internal) return false;
    
    const ip = this.address;
    // Check for private IP ranges
    return (
      ip.startsWith('192.168.') ||
      ip.startsWith('10.') ||
      (ip.startsWith('172.') && 
       parseInt(ip.split('.')[1]) >= 16 && 
       parseInt(ip.split('.')[1]) <= 31)
    );
  }

  /**
   * Get priority score for interface selection
   */
  getPriority() {
    if (this.internal) return 0;
    if (this.interface.startsWith('en')) return 100; // Ethernet/WiFi
    if (this.interface.startsWith('wl')) return 90;  // Wireless
    if (this.interface.startsWith('eth')) return 80; // Ethernet
    return 50; // Other interfaces
  }
}

/**
 * Unified Network Discovery Class
 */
export class NetworkDiscovery {
  constructor() {
    this.networkInterfaces = this.discoverNetworkInterfaces();
    this.primaryInterface = this.selectPrimaryInterface();
  }

  /**
   * Discover all network interfaces and their IP addresses
   */
  discoverNetworkInterfaces() {
    const interfaces = networkInterfaces();
    const networkInfo = [];
    
    for (const [name, addresses] of Object.entries(interfaces)) {
      if (!addresses) continue;
      
      for (const addr of addresses) {
        // Only process IPv4 addresses
        if (addr.family === 'IPv4') {
          networkInfo.push(new NetworkInfo(name, addr.address, addr.family, addr.internal));
        }
      }
    }
    
    return networkInfo;
  }

  /**
   * Select the primary network interface for configuration
   */
  selectPrimaryInterface() {
    const externalInterfaces = this.getExternalInterfaces();
    
    if (externalInterfaces.length === 0) {
      return null;
    }

    // Sort by priority and select the best one
    return externalInterfaces.sort((a, b) => b.getPriority() - a.getPriority())[0];
  }

  /**
   * Get all external (non-loopback) network interfaces
   */
  getExternalInterfaces() {
    return this.networkInterfaces.filter(info => !info.internal);
  }

  /**
   * Get local network interfaces (private IP ranges)
   */
  getLocalNetworkInterfaces() {
    return this.networkInterfaces.filter(info => info.isLocalNetwork());
  }

  /**
   * Get the primary network IP address
   */
  getPrimaryNetworkIP() {
    return this.primaryInterface ? this.primaryInterface.address : null;
  }

  /**
   * Generate CORS origins for given ports
   */
  generateCORSOrigins(ports = [3000, 5173]) {
    const origins = [];
    
    // Add localhost origins
    for (const port of ports) {
      origins.push(`http://localhost:${port}`);
      origins.push(`http://127.0.0.1:${port}`);
    }
    
    // Add network IP origins
    const networkIP = this.getPrimaryNetworkIP();
    if (networkIP) {
      for (const port of ports) {
        origins.push(`http://${networkIP}:${port}`);
      }
    }
    
    return origins;
  }

  /**
   * Generate network configuration for backend
   */
  generateBackendConfig() {
    const networkIP = this.getPrimaryNetworkIP();
    const corsOrigins = this.generateCORSOrigins([3000, 5173]);
    
    return {
      networkIP,
      corsOrigins: corsOrigins.join(','),
      host: '0.0.0.0',
      port: 3001,
      networkAccessEnabled: true
    };
  }

  /**
   * Generate network configuration for frontend
   */
  generateFrontendConfig() {
    const networkIP = this.getPrimaryNetworkIP();
    
    return {
      networkIP,
      apiUrl: networkIP ? `http://${networkIP}:3001/api` : 'http://localhost:3001/api',
      proxyTarget: networkIP ? `http://${networkIP}:3001` : 'http://localhost:3001',
      networkMode: !!networkIP,
      port: 3000
    };
  }

  /**
   * Display network discovery results
   */
  displayResults() {
    console.log('\n🌐 Network Discovery Results');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n📍 Available Network Interfaces:');
    this.networkInterfaces.forEach(info => {
      const type = info.internal ? '🏠 Local' : '🌐 Network';
      const priority = info.internal ? '' : ` (Priority: ${info.getPriority()})`;
      console.log(`  ${type}: ${info.address} (${info.interface})${priority}`);
    });
    
    if (this.primaryInterface) {
      console.log(`\n⭐ Primary Interface: ${this.primaryInterface.address} (${this.primaryInterface.interface})`);
      
      console.log('\n🚀 Network Access URLs:');
      console.log(`  🌐 Frontend: http://${this.primaryInterface.address}:3000`);
      console.log(`  🌐 Backend:  http://${this.primaryInterface.address}:3001`);
      console.log(`  🌐 API Docs: http://${this.primaryInterface.address}:3001/api-docs`);
      
    } else {
      console.log('\n⚠️  No external network interfaces found.');
      console.log('   Applications will only be accessible locally.');
    }
  }

  /**
   * Validate network configuration
   */
  validateConfiguration() {
    const issues = [];
    
    if (!this.primaryInterface) {
      issues.push('No network interface available for external access');
    }
    
    if (this.getExternalInterfaces().length === 0) {
      issues.push('No external network interfaces detected');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Get network setup summary
   */
  getSetupSummary() {
    const networkIP = this.getPrimaryNetworkIP();
    const backendConfig = this.generateBackendConfig();
    const frontendConfig = this.generateFrontendConfig();
    
    return {
      networkIP,
      hasNetworkAccess: !!networkIP,
      backend: backendConfig,
      frontend: frontendConfig,
      accessUrls: {
        frontend: networkIP ? `http://${networkIP}:3000` : 'http://localhost:3000',
        backend: networkIP ? `http://${networkIP}:3001` : 'http://localhost:3001',
        apiDocs: networkIP ? `http://${networkIP}:3001/api-docs` : 'http://localhost:3001/api-docs'
      }
    };
  }
}

/**
 * Create a new NetworkDiscovery instance
 */
export function createNetworkDiscovery() {
  return new NetworkDiscovery();
}

/**
 * Quick network discovery for CLI usage
 */
export function quickDiscovery() {
  const discovery = new NetworkDiscovery();
  discovery.displayResults();
  return discovery.getSetupSummary();
}

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const discovery = new NetworkDiscovery();
  
  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(discovery.getSetupSummary(), null, 2));
  } else {
    discovery.displayResults();
    
    const validation = discovery.validateConfiguration();
    if (!validation.isValid) {
      console.log('\n⚠️  Configuration Issues:');
      validation.issues.forEach(issue => console.log(`   - ${issue}`));
    }
  }
}
