#!/usr/bin/env node
/**
 * Network Setup CLI Interface
 * 
 * User-friendly command-line interface for network configuration
 * with progress indicators, clear messages, and comprehensive help.
 */

import { NetworkSetupOrchestrator, BackupManager } from './network-setup.js';
import { createNetworkDiscovery } from './network-discovery.js';

/**
 * CLI Command Handler
 */
class NetworkCLI {
  constructor() {
    this.orchestrator = new NetworkSetupOrchestrator();
    this.backupManager = new BackupManager(process.cwd());
  }

  /**
   * Display help information
   */
  showHelp() {
    console.log(`
🌐 DOAXVV Handbook - Network Setup CLI

USAGE:
  node scripts/network-cli.js [command] [options]

COMMANDS:
  setup                 Configure both frontend and backend for network access
  setup --validate      Configure and run validation tests
  discover              Discover available network interfaces
  validate              Run network validation tests
  test                  Quick connectivity test
  revert                Revert to localhost configuration
  backup list           List available configuration backups
  backup restore <file> Restore from backup file
  help                  Show this help message

OPTIONS:
  --validate            Run validation tests after setup
  --json               Output results in JSON format
  --verbose            Show detailed progress information
  --force              Force setup even if validation fails

EXAMPLES:
  node scripts/network-cli.js setup
  node scripts/network-cli.js setup --validate
  node scripts/network-cli.js discover --json
  node scripts/network-cli.js validate
  node scripts/network-cli.js backup list
  node scripts/network-cli.js revert

NETWORK ACCESS:
  After successful setup, your applications will be accessible at:
  - Frontend: http://<your-ip>:3000
  - Backend:  http://<your-ip>:3001
  - API Docs: http://<your-ip>:3001/api-docs

TROUBLESHOOTING:
  If setup fails, try:
  1. Check firewall settings (allow ports 3000, 3001)
  2. Ensure .env.example files exist
  3. Verify network connectivity
  4. Run 'validate' command for detailed diagnostics

For more information, see:
  - backend/docs/NETWORK_ACCESS.md
  - frontend/docs/NETWORK_ACCESS.md
`);
  }

  /**
   * Handle setup command
   */
  async handleSetup(args) {
    const options = {
      validate: args.includes('--validate'),
      verbose: args.includes('--verbose'),
      force: args.includes('--force')
    };

    try {
      console.log('🚀 DOAXVV Handbook - Automated Network Setup');
      console.log('═══════════════════════════════════════════════════════════');
      
      if (options.verbose) {
        console.log('Options:', options);
      }

      const result = await this.orchestrator.executeSetup(options);
      
      if (args.includes('--json')) {
        console.log(JSON.stringify(result, null, 2));
      }

      return result;
    } catch (error) {
      console.error('\n❌ Setup failed:', error.message);
      
      if (options.verbose) {
        console.error('Stack trace:', error.stack);
      }
      
      console.log('\n💡 Try running with --verbose for more details');
      console.log('💡 Or run "node scripts/network-cli.js help" for usage information');
      
      process.exit(1);
    }
  }

  /**
   * Handle discover command
   */
  async handleDiscover(args) {
    const discovery = createNetworkDiscovery();
    
    if (args.includes('--json')) {
      const summary = discovery.getSetupSummary();
      console.log(JSON.stringify(summary, null, 2));
    } else {
      discovery.displayResults();
      
      const validation = discovery.validateConfiguration();
      if (!validation.isValid) {
        console.log('\n⚠️  Configuration Issues:');
        validation.issues.forEach(issue => console.log(`   - ${issue}`));
      }
    }
  }

  /**
   * Handle validate command
   */
  async handleValidate(args) {
    try {
      const result = await this.orchestrator.runValidation();
      
      if (args.includes('--json')) {
        console.log(JSON.stringify(result, null, 2));
      }
      
      return result;
    } catch (error) {
      console.error('\n❌ Validation failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Handle test command
   */
  async handleTest(args) {
    try {
      const result = await this.orchestrator.quickTest();
      
      if (args.includes('--json')) {
        console.log(JSON.stringify(result, null, 2));
      }
      
      return result;
    } catch (error) {
      console.error('\n❌ Test failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Handle revert command
   */
  async handleRevert(args) {
    try {
      const result = await this.orchestrator.revertToLocalhost();
      
      if (args.includes('--json')) {
        console.log(JSON.stringify(result, null, 2));
      }
      
      return result;
    } catch (error) {
      console.error('\n❌ Revert failed:', error.message);
      process.exit(1);
    }
  }

  /**
   * Handle backup commands
   */
  async handleBackup(args) {
    const subcommand = args[1];
    
    if (subcommand === 'list') {
      const backups = this.backupManager.listBackups();
      
      if (backups.length === 0) {
        console.log('No backups found.');
        return;
      }
      
      console.log('\n📦 Available Backups:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup.file}`);
        console.log(`   App: ${backup.app}`);
        console.log(`   Date: ${backup.date.toLocaleString()}`);
        console.log('');
      });
      
    } else if (subcommand === 'restore') {
      const backupFile = args[2];
      
      if (!backupFile) {
        console.error('❌ Please specify a backup file to restore');
        console.log('💡 Use "backup list" to see available backups');
        process.exit(1);
      }
      
      try {
        const result = this.backupManager.restoreFromBackup(backupFile);
        console.log(`✅ Restored ${result.app} configuration from ${result.backupFile}`);
        console.log(`   Target: ${result.targetPath}`);
      } catch (error) {
        console.error('❌ Restore failed:', error.message);
        process.exit(1);
      }
      
    } else {
      console.error('❌ Unknown backup command:', subcommand);
      console.log('💡 Available commands: list, restore <file>');
      process.exit(1);
    }
  }

  /**
   * Parse and execute CLI commands
   */
  async execute() {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('help') || args.includes('--help') || args.includes('-h')) {
      this.showHelp();
      return;
    }
    
    const command = args[0];
    
    try {
      switch (command) {
        case 'setup':
          await this.handleSetup(args);
          break;
          
        case 'discover':
          await this.handleDiscover(args);
          break;
          
        case 'validate':
          await this.handleValidate(args);
          break;
          
        case 'test':
          await this.handleTest(args);
          break;
          
        case 'revert':
          await this.handleRevert(args);
          break;
          
        case 'backup':
          await this.handleBackup(args);
          break;
          
        default:
          console.error(`❌ Unknown command: ${command}`);
          console.log('💡 Run "node scripts/network-cli.js help" for usage information');
          process.exit(1);
      }
    } catch (error) {
      console.error('\n❌ Command failed:', error.message);
      process.exit(1);
    }
  }
}

// Execute CLI if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new NetworkCLI();
  cli.execute().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { NetworkCLI };
