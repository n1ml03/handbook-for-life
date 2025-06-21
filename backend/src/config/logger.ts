import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// LOGGER INTERFACES & TYPES
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: any;
  context?: {
    requestId?: string;
    userId?: string;
    ip?: string;
    userAgent?: string;
    method?: string;
    url?: string;
    statusCode?: number;
    duration?: number;
  };
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableFile: boolean;
  logDir: string;
  maxFileSize: number;
  maxFiles: number;
  enableJson: boolean;
  enableColors: boolean;
  datePattern: string;
}

// ============================================================================
// LOG LEVEL HIERARCHY
// ============================================================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// ============================================================================
// COLOR SUPPORT
// ============================================================================

const COLORS = {
  debug: '\x1b[36m',    // Cyan
  info: '\x1b[32m',     // Green
  warn: '\x1b[33m',     // Yellow
  error: '\x1b[31m',    // Red
  reset: '\x1b[0m'
};

// ============================================================================
// CONFIGURATION
// ============================================================================

const config: LoggerConfig = {
  level: (process.env.LOG_LEVEL as LogLevel) || 'info',
  enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
  enableFile: process.env.LOG_ENABLE_FILE === 'true',
  logDir: process.env.LOG_DIR || './logs',
  maxFileSize: parseInt(process.env.LOG_MAX_FILE_SIZE || '10485760'), // 10MB
  maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
  enableJson: process.env.LOG_FORMAT === 'json',
  enableColors: process.env.LOG_ENABLE_COLORS !== 'false' && process.stdout.isTTY,
  datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD'
};

// ============================================================================
// ENHANCED LOGGER CLASS
// ============================================================================

class EnhancedLogger {
  private config: LoggerConfig;
  private logBuffer: LogEntry[] = [];
  private writeStream: fs.WriteStream | null = null;
  private currentLogFile: string | null = null;

  constructor(config: LoggerConfig) {
    this.config = config;
    this.initializeFileLogging();
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private initializeFileLogging(): void {
    if (!this.config.enableFile) return;

    try {
      // Ensure log directory exists
      if (!fs.existsSync(this.config.logDir)) {
        fs.mkdirSync(this.config.logDir, { recursive: true });
      }

      this.createNewLogFile();
      this.setupLogRotation();
    } catch (error) {
      console.error('Failed to initialize file logging:', error);
    }
  }

  private createNewLogFile(): void {
    if (!this.config.enableFile) return;

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `app-${timestamp}.log`;
    this.currentLogFile = path.join(this.config.logDir, filename);

    if (this.writeStream) {
      this.writeStream.end();
    }

    this.writeStream = fs.createWriteStream(this.currentLogFile, { flags: 'a' });

    this.writeStream.on('error', (error) => {
      console.error('Log file write error:', error);
    });
  }

  private setupLogRotation(): void {
    if (!this.config.enableFile || !this.currentLogFile) return;

    // Check file size every minute
    setInterval(() => {
      try {
        if (!this.currentLogFile || !fs.existsSync(this.currentLogFile)) return;

        const stats = fs.statSync(this.currentLogFile);
        if (stats.size > this.config.maxFileSize) {
          this.rotateLogFile();
        }
      } catch (error) {
        console.error('Error during log rotation check:', error);
      }
    }, 60000);

    // Clean up old log files
    this.cleanupOldLogs();
  }

  private rotateLogFile(): void {
    if (!this.currentLogFile) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const rotatedFile = this.currentLogFile.replace('.log', `-${timestamp}.log`);

    try {
      if (this.writeStream) {
        this.writeStream.end();
      }

      fs.renameSync(this.currentLogFile, rotatedFile);
      this.createNewLogFile();
    } catch (error) {
      console.error('Log rotation failed:', error);
    }
  }

  private cleanupOldLogs(): void {
    if (!this.config.enableFile) return;

    try {
      const files = fs.readdirSync(this.config.logDir)
        .filter(file => file.endsWith('.log'))
        .map(file => ({
          name: file,
          path: path.join(this.config.logDir, file),
          time: fs.statSync(path.join(this.config.logDir, file)).mtime
        }))
        .sort((a, b) => b.time.getTime() - a.time.getTime());

      // Keep only the newest files
      const filesToDelete = files.slice(this.config.maxFiles);
      filesToDelete.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (error) {
          console.error(`Failed to delete old log file ${file.name}:`, error);
        }
      });
    } catch (error) {
      console.error('Cleanup old logs failed:', error);
    }
  }

  // ============================================================================
  // FORMATTING
  // ============================================================================

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  private formatConsoleMessage(entry: LogEntry): string {
    const { level, message, timestamp, meta, context, error } = entry;

    if (this.config.enableJson) {
      return JSON.stringify(entry);
    }

    const color = this.config.enableColors ? COLORS[level] : '';
    const reset = this.config.enableColors ? COLORS.reset : '';
    
    let formattedMessage = `${color}${timestamp} [${level.toUpperCase()}]:${reset} ${message}`;

    // Add context information
    if (context) {
      const contextParts = [];
      if (context.requestId) contextParts.push(`reqId=${context.requestId}`);
      if (context.userId) contextParts.push(`userId=${context.userId}`);
      if (context.method && context.url) contextParts.push(`${context.method} ${context.url}`);
      if (context.statusCode) contextParts.push(`status=${context.statusCode}`);
      if (context.duration) contextParts.push(`${context.duration}ms`);
      
      if (contextParts.length > 0) {
        formattedMessage += ` [${contextParts.join(', ')}]`;
      }
    }

    // Add meta information
    if (meta) {
      formattedMessage += ` ${JSON.stringify(meta)}`;
    }

    // Add error information
    if (error) {
      formattedMessage += `\n  Error: ${error.name}: ${error.message}`;
      if (error.stack && level === 'error') {
        formattedMessage += `\n  Stack: ${error.stack}`;
      }
    }

    return formattedMessage;
  }

  private formatFileMessage(entry: LogEntry): string {
    return JSON.stringify(entry) + '\n';
  }

  // ============================================================================
  // LOGGING METHODS
  // ============================================================================

  private log(level: LogLevel, message: string, meta?: any, context?: LogEntry['context']): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: this.getTimestamp(),
      meta,
      context
    };

    // Handle Error objects
    if (meta instanceof Error) {
      entry.error = {
        name: meta.name,
        message: meta.message,
        stack: meta.stack
      };
      entry.meta = undefined;
    }

    // Console output
    if (this.config.enableConsole) {
      const consoleMethod = level === 'error' ? console.error : 
                           level === 'warn' ? console.warn : console.log;
      consoleMethod(this.formatConsoleMessage(entry));
    }

    // File output
    if (this.config.enableFile && this.writeStream) {
      this.writeStream.write(this.formatFileMessage(entry));
    }

    // Buffer for external processing
    this.logBuffer.push(entry);
    
    // Keep buffer size manageable
    if (this.logBuffer.length > 1000) {
      this.logBuffer = this.logBuffer.slice(-500);
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  debug(message: string, meta?: any, context?: LogEntry['context']): void {
    this.log('debug', message, meta, context);
  }

  info(message: string, meta?: any, context?: LogEntry['context']): void {
    this.log('info', message, meta, context);
  }

  warn(message: string, meta?: any, context?: LogEntry['context']): void {
    this.log('warn', message, meta, context);
  }

  error(message: string, meta?: any, context?: LogEntry['context']): void {
    this.log('error', message, meta, context);
  }

  // HTTP request logging
  logRequest(req: any, res: any, duration: number): void {
    const context: LogEntry['context'] = {
      requestId: req.id || req.headers['x-request-id'],
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    };

    const level: LogLevel = res.statusCode >= 500 ? 'error' : 
                           res.statusCode >= 400 ? 'warn' : 'info';

    this.log(level, `${req.method} ${req.url}`, null, context);
  }

  // Get recent logs (for debugging/monitoring)
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel, count: number = 100): LogEntry[] {
    return this.logBuffer
      .filter(entry => entry.level === level)
      .slice(-count);
  }

  // Change log level at runtime
  setLogLevel(level: LogLevel): void {
    this.config.level = level;
    this.info(`Log level changed to: ${level}`);
  }

  // Get current configuration
  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // Flush pending logs
  flush(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.writeStream) {
        this.writeStream.write('', (error) => {
          if (error) reject(error);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }

  // Graceful shutdown
  async shutdown(): Promise<void> {
    this.info('Logger shutdown initiated...');
    
    await this.flush();
    
    if (this.writeStream) {
      return new Promise((resolve) => {
        this.writeStream!.end(() => {
          this.writeStream = null;
          resolve();
        });
      });
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const logger = new EnhancedLogger(config);

// Handle process termination
process.on('SIGTERM', async () => {
  await logger.shutdown();
});

process.on('SIGINT', async () => {
  await logger.shutdown();
});

// ============================================================================
// EXPORTS
// ============================================================================

export default logger;
export { EnhancedLogger, LoggerConfig, LogEntry, LogLevel }; 