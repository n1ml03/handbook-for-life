#!/usr/bin/env node
/**
 * Automated Network Setup Script
 * 
 * Configures both frontend and backend applications for network access
 * with complete consistency and validation.
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync, mkdirSync, readdirSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createNetworkDiscovery } from './network-discovery.js';
import { NetworkValidator } from './network-validator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

/**
 * Configuration Manager for Environment Files
 */
class ConfigurationManager {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.backendEnvPath = join(projectRoot, 'backend', '.env');
    this.frontendEnvPath = join(projectRoot, 'frontend', '.env');
    this.backupDir = join(projectRoot, '.network-setup-backups');
  }

  /**
   * Create backup directory if it doesn't exist
   */
  ensureBackupDirectory() {
    if (!existsSync(this.backupDir)) {
      mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Create backup of existing .env files
   */
  createBackups() {
    this.ensureBackupDirectory();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    
    const backups = {
      backend: null,
      frontend: null
    };

    if (existsSync(this.backendEnvPath)) {
      const backupPath = join(this.backupDir, `backend.env.${timestamp}`);
      copyFileSync(this.backendEnvPath, backupPath);
      backups.backend = backupPath;
    }

    if (existsSync(this.frontendEnvPath)) {
      const backupPath = join(this.backupDir, `frontend.env.${timestamp}`);
      copyFileSync(this.frontendEnvPath, backupPath);
      backups.frontend = backupPath;
    }

    return backups;
  }

  /**
   * Update environment variable in file content
   */
  updateEnvVariable(content, key, value) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const newLine = `${key}=${value}`;
    
    if (regex.test(content)) {
      return content.replace(regex, newLine);
    } else {
      // Add the variable at the end
      return content.trim() + '\n' + newLine + '\n';
    }
  }

  /**
   * Configure backend environment for network access
   */
  configureBackend(networkConfig) {
    if (!existsSync(this.backendEnvPath)) {
      const examplePath = join(dirname(this.backendEnvPath), '.env.example');
      if (existsSync(examplePath)) {
        copyFileSync(examplePath, this.backendEnvPath);
      } else {
        throw new Error('Backend .env file not found and no .env.example available');
      }
    }

    let content = readFileSync(this.backendEnvPath, 'utf-8');
    
    // Update network-related variables
    content = this.updateEnvVariable(content, 'HOST', networkConfig.backend.host);
    content = this.updateEnvVariable(content, 'CORS_ORIGINS', networkConfig.backend.corsOrigins);
    content = this.updateEnvVariable(content, 'NETWORK_ACCESS_ENABLED', 'true');
    
    writeFileSync(this.backendEnvPath, content);
    
    return {
      path: this.backendEnvPath,
      changes: {
        HOST: networkConfig.backend.host,
        CORS_ORIGINS: networkConfig.backend.corsOrigins,
        NETWORK_ACCESS_ENABLED: 'true'
      }
    };
  }

  /**
   * Configure frontend environment for network access
   */
  configureFrontend(networkConfig) {
    if (!existsSync(this.frontendEnvPath)) {
      const examplePath = join(dirname(this.frontendEnvPath), '.env.example');
      if (existsSync(examplePath)) {
        copyFileSync(examplePath, this.frontendEnvPath);
      } else {
        throw new Error('Frontend .env file not found and no .env.example available');
      }
    }

    let content = readFileSync(this.frontendEnvPath, 'utf-8');
    
    // Update network-related variables
    content = this.updateEnvVariable(content, 'VITE_API_URL', networkConfig.frontend.apiUrl);
    content = this.updateEnvVariable(content, 'VITE_API_PROXY_TARGET', networkConfig.frontend.proxyTarget);
    content = this.updateEnvVariable(content, 'VITE_NETWORK_MODE', networkConfig.frontend.networkMode.toString());
    
    writeFileSync(this.frontendEnvPath, content);
    
    return {
      path: this.frontendEnvPath,
      changes: {
        VITE_API_URL: networkConfig.frontend.apiUrl,
        VITE_API_PROXY_TARGET: networkConfig.frontend.proxyTarget,
        VITE_NETWORK_MODE: networkConfig.frontend.networkMode.toString()
      }
    };
  }

  /**
   * Revert to localhost configuration
   */
  revertToLocalhost() {
    const localhostConfig = {
      backend: {
        host: '0.0.0.0',
        corsOrigins: 'http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173'
      },
      frontend: {
        apiUrl: 'http://localhost:3001/api',
        proxyTarget: 'http://localhost:3001',
        networkMode: false
      }
    };

    const results = {};

    if (existsSync(this.backendEnvPath)) {
      results.backend = this.configureBackend({ backend: localhostConfig.backend });
    }

    if (existsSync(this.frontendEnvPath)) {
      results.frontend = this.configureFrontend({ frontend: localhostConfig.frontend });
    }

    return results;
  }
}

/**
 * Network Setup Orchestrator
 */
class NetworkSetupOrchestrator {
  constructor() {
    this.discovery = createNetworkDiscovery();
    this.configManager = new ConfigurationManager(projectRoot);
    this.setupSummary = null;
  }

  /**
   * Display progress indicator
   */
  showProgress(message, step, total) {
    const progress = `[${step}/${total}]`;
    console.log(`${progress} ${message}`);
  }

  /**
   * Execute complete network setup
   */
  async executeSetup(options = {}) {
    console.log('🚀 Starting Automated Network Setup');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    try {
      // Step 1: Network Discovery
      this.showProgress('🔍 Discovering network interfaces...', 1, 6);
      const networkConfig = this.discovery.getSetupSummary();
      
      if (!networkConfig.hasNetworkAccess) {
        console.log('\n⚠️  No network interfaces available for external access.');
        console.log('   Configuration will use localhost settings.');
        return this.setupLocalhost();
      }

      console.log(`   ✅ Primary network IP: ${networkConfig.networkIP}`);

      // Step 2: Create backups
      this.showProgress('💾 Creating configuration backups...', 2, 6);
      const backups = this.configManager.createBackups();
      
      if (backups.backend) console.log(`   ✅ Backend backup: ${backups.backend}`);
      if (backups.frontend) console.log(`   ✅ Frontend backup: ${backups.frontend}`);

      // Step 3: Configure backend
      this.showProgress('⚙️  Configuring backend for network access...', 3, 6);
      const backendResult = this.configManager.configureBackend(networkConfig);
      console.log(`   ✅ Updated: ${backendResult.path}`);

      // Step 4: Configure frontend
      this.showProgress('⚙️  Configuring frontend for network access...', 4, 6);
      const frontendResult = this.configManager.configureFrontend(networkConfig);
      console.log(`   ✅ Updated: ${frontendResult.path}`);

      // Step 5: Validate configuration
      this.showProgress('🔍 Validating configuration consistency...', 5, 6);
      const validation = this.validateConfiguration(networkConfig);
      
      if (validation.isValid) {
        console.log('   ✅ Configuration validation passed');
      } else {
        console.log('   ⚠️  Configuration validation issues detected');
        validation.issues.forEach(issue => console.log(`      - ${issue}`));
      }

      // Step 6: Display results
      this.showProgress('📋 Generating setup summary...', 6, 7);
      this.setupSummary = {
        networkConfig,
        backups,
        backendResult,
        frontendResult,
        validation
      };

      this.displaySetupResults();

      // Step 7: Optional validation (if requested)
      if (options.validate) {
        this.showProgress('🧪 Running network validation tests...', 7, 7);
        const validator = new NetworkValidator(networkConfig);
        const validationReport = await validator.validateNetworkSetup();
        this.setupSummary.validationReport = validationReport;
      }

      return this.setupSummary;

    } catch (error) {
      console.error('\n❌ Network setup failed:', error.message);
      console.log('\n💡 Troubleshooting tips:');
      console.log('   - Ensure .env.example files exist in both frontend and backend directories');
      console.log('   - Check file permissions for .env files');
      console.log('   - Verify network interfaces are available');
      throw error;
    }
  }

  /**
   * Setup localhost configuration
   */
  setupLocalhost() {
    console.log('\n🏠 Configuring for localhost access...');
    const results = this.configManager.revertToLocalhost();
    
    console.log('\n✅ Localhost configuration complete');
    console.log('   🌍 Frontend: http://localhost:3000');
    console.log('   🌍 Backend:  http://localhost:3001');
    
    return { localhost: true, results };
  }

  /**
   * Validate configuration consistency
   */
  validateConfiguration(networkConfig) {
    const issues = [];
    
    // Check if frontend API URL matches backend network endpoint
    const expectedBackendUrl = `http://${networkConfig.networkIP}:3001`;
    if (!networkConfig.frontend.apiUrl.startsWith(expectedBackendUrl)) {
      issues.push('Frontend API URL does not match backend network endpoint');
    }

    // Check if CORS origins include frontend network URL
    const frontendNetworkUrl = `http://${networkConfig.networkIP}:3000`;
    if (!networkConfig.backend.corsOrigins.includes(frontendNetworkUrl)) {
      issues.push('Backend CORS origins do not include frontend network URL');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }

  /**
   * Display setup results
   */
  displaySetupResults() {
    const { networkConfig } = this.setupSummary;
    
    console.log('\n🎉 Network Setup Complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n🌐 Network Access URLs:');
    console.log(`   Frontend: ${networkConfig.accessUrls.frontend}`);
    console.log(`   Backend:  ${networkConfig.accessUrls.backend}`);
    console.log(`   API Docs: ${networkConfig.accessUrls.apiDocs}`);
    
    console.log('\n⚙️  Configuration Summary:');
    console.log(`   Network IP: ${networkConfig.networkIP}`);
    console.log(`   Backend Host: ${networkConfig.backend.host}`);
    console.log(`   Frontend Network Mode: ${networkConfig.frontend.networkMode}`);
    
    console.log('\n🚀 Next Steps:');
    console.log('   1. Start backend: cd backend && bun run dev');
    console.log('   2. Start frontend: cd frontend && bun run dev');
    console.log('   3. Access from other devices using the network URLs above');
    
    console.log('\n🔒 Security Notes:');
    console.log('   - Ensure firewall allows ports 3000 and 3001');
    console.log('   - Network access exposes services to local network');
    console.log('   - Consider enabling authentication for production use');
  }

  /**
   * Run network validation independently
   */
  async runValidation() {
    console.log('🧪 Running Network Validation');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const networkConfig = this.discovery.getSetupSummary();

    if (!networkConfig.hasNetworkAccess) {
      console.log('\n⚠️  No network access configured. Run setup first.');
      return { error: 'No network access configured' };
    }

    const validator = new NetworkValidator(networkConfig);
    return await validator.validateNetworkSetup();
  }

  /**
   * Quick connectivity test
   */
  async quickTest() {
    const networkConfig = this.discovery.getSetupSummary();

    if (!networkConfig.hasNetworkAccess) {
      console.log('⚠️  No network access configured.');
      return { error: 'No network access configured' };
    }

    const validator = new NetworkValidator(networkConfig);
    return await validator.quickTest();
  }

  /**
   * Revert to localhost configuration
   */
  async revertToLocalhost() {
    console.log('🔄 Reverting to localhost configuration...');

    const results = this.configManager.revertToLocalhost();

    console.log('\n✅ Reverted to localhost configuration');
    console.log('   🌍 Frontend: http://localhost:3000');
    console.log('   🌍 Backend:  http://localhost:3001');

    return results;
  }
}

/**
 * Backup and Restore Manager
 */
class BackupManager {
  constructor(projectRoot) {
    this.projectRoot = projectRoot;
    this.backupDir = join(projectRoot, '.network-setup-backups');
  }

  /**
   * List available backups
   */
  listBackups() {
    if (!existsSync(this.backupDir)) {
      return [];
    }

    const files = readdirSync(this.backupDir);

    const backups = [];
    const backupPattern = /^(backend|frontend)\.env\.(.+)$/;

    files.forEach(file => {
      const match = file.match(backupPattern);
      if (match) {
        const [, app, timestamp] = match;
        backups.push({
          app,
          timestamp,
          file,
          path: join(this.backupDir, file),
          date: new Date(timestamp.replace(/-/g, ':'))
        });
      }
    });

    return backups.sort((a, b) => b.date - a.date);
  }

  /**
   * Restore from backup
   */
  restoreFromBackup(backupFile) {
    const backupPath = join(this.backupDir, backupFile);
    if (!existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupFile}`);
    }

    const match = backupFile.match(/^(backend|frontend)\.env\.(.+)$/);
    if (!match) {
      throw new Error(`Invalid backup file format: ${backupFile}`);
    }

    const [, app] = match;
    const targetPath = join(this.projectRoot, app, '.env');

    copyFileSync(backupPath, targetPath);

    return {
      app,
      backupFile,
      targetPath,
      restored: true
    };
  }

  /**
   * Clean old backups (keep last 10)
   */
  cleanOldBackups() {
    const backups = this.listBackups();
    const toDelete = backups.slice(10); // Keep last 10 backups

    toDelete.forEach(backup => {
      unlinkSync(backup.path);
    });

    return toDelete.length;
  }
}

export { NetworkSetupOrchestrator, ConfigurationManager, BackupManager };
