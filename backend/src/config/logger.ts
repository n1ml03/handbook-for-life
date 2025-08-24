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
  // Enhanced formatting options
  enableSymbols: boolean;
  enableIndentation: boolean;
  enableSeparators: boolean;
  compactMode: boolean;
  maxMetaLength: number;
  timestampFormat: 'iso' | 'short' | 'time-only';
  // Business-friendly console options
  businessFriendlyConsole: boolean;
  hideStackTraces: boolean;
  hideTechnicalDetails: boolean;
  simplifyMessages: boolean;
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
// ENHANCED COLOR SUPPORT & VISUAL FORMATTING
// ============================================================================

const COLORS = {
  // Log levels
  debug: '\x1b[90m',    // Bright black (gray)
  info: '\x1b[36m',     // Cyan
  warn: '\x1b[33m',     // Yellow
  error: '\x1b[31m',    // Red

  // UI elements
  timestamp: '\x1b[90m', // Gray
  level: '\x1b[1m',     // Bold
  message: '\x1b[0m',   // Reset/normal
  context: '\x1b[35m',  // Magenta
  meta: '\x1b[34m',     // Blue
  error_detail: '\x1b[91m', // Bright red
  success: '\x1b[32m',  // Green

  // Special formatting
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  underline: '\x1b[4m',
  reset: '\x1b[0m',

  // Background colors for emphasis
  bg_red: '\x1b[41m',
  bg_yellow: '\x1b[43m',
  bg_green: '\x1b[42m',
  bg_blue: '\x1b[44m'
};

// Visual symbols for different log types
const SYMBOLS = {
  debug: '🔍',
  info: 'ℹ️ ',
  warn: '⚠️ ',
  error: '❌',
  success: '✅',
  request: '📥',
  response: '📤',
  database: '🗄️ ',
  security: '🔒',
  performance: '⚡',
  separator: '─'.repeat(80),
  bullet: '•',
  arrow: '→',
  check: '✓',
  cross: '✗'
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
  datePattern: process.env.LOG_DATE_PATTERN || 'YYYY-MM-DD',
  // Enhanced formatting options
  enableSymbols: process.env.LOG_ENABLE_SYMBOLS !== 'false',
  enableIndentation: process.env.LOG_ENABLE_INDENTATION !== 'false',
  enableSeparators: process.env.LOG_ENABLE_SEPARATORS === 'true',
  compactMode: process.env.LOG_COMPACT_MODE === 'true',
  maxMetaLength: parseInt(process.env.LOG_MAX_META_LENGTH || '500'),
  timestampFormat: (process.env.LOG_TIMESTAMP_FORMAT as 'iso' | 'short' | 'time-only') || 'short',
  // Business-friendly console options
  businessFriendlyConsole: process.env.LOG_BUSINESS_FRIENDLY === 'true',
  hideStackTraces: process.env.LOG_HIDE_STACK_TRACES === 'true',
  hideTechnicalDetails: process.env.LOG_HIDE_TECHNICAL_DETAILS === 'true',
  simplifyMessages: process.env.LOG_SIMPLIFY_MESSAGES === 'true'
};

// ============================================================================
// ENHANCED LOGGER CLASS
// ============================================================================

export class EnhancedLogger {
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
  // UTILITY METHODS
  // ============================================================================

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }

  // ============================================================================
  // BUSINESS-FRIENDLY MESSAGE TRANSLATION
  // ============================================================================

  private translateToBusinessFriendly(message: string, level: LogLevel, context?: LogEntry['context']): string {
    if (!this.config.businessFriendlyConsole && !this.config.simplifyMessages) {
      return message;
    }

    // Common technical terms to business-friendly translations
    const translations: Record<string, string> = {
      'HTTP Request Completed': 'Request processed',
      'Incoming API Request': 'Processing request',
      'Database Query Executed': 'Data retrieved',
      'Database Query Failed': 'Data access error',
      'Security Event': 'Security alert',
      'Performance': 'System performance',
      'Failed to connect to database': 'Database connection issue',
      'Server started': 'Application started',
      'Server shutting down': 'Application stopping',
      'Authentication failed': 'Login failed',
      'Authorization failed': 'Access denied',
      'Validation error': 'Invalid input',
      'Rate limit exceeded': 'Too many requests',
      'File upload failed': 'Upload error',
      'Cache miss': 'Loading fresh data',
      'Cache hit': 'Using cached data'
    };

    // Apply translations
    let friendlyMessage = message;
    for (const [technical, friendly] of Object.entries(translations)) {
      if (message.includes(technical)) {
        friendlyMessage = friendlyMessage.replace(technical, friendly);
      }
    }

    // Remove technical symbols and emojis if simplifying
    if (this.config.simplifyMessages) {
      friendlyMessage = friendlyMessage
        .replace(/[📥📤🗄️🔒⚡🔍]/g, '') // Remove technical emojis
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
    }

    // Add context-based friendly descriptions
    if (context) {
      if (context.method && context.url && level === 'info') {
        const action = context.method === 'GET' ? 'Retrieved' :
                      context.method === 'POST' ? 'Created' :
                      context.method === 'PUT' ? 'Updated' :
                      context.method === 'DELETE' ? 'Deleted' : 'Processed';

        const resource = this.extractResourceFromUrl(context.url);
        if (resource) {
          return `${action} ${resource}`;
        }
      }

      if (context.statusCode && context.statusCode >= 400) {
        if (context.statusCode === 404) return 'Resource not found';
        if (context.statusCode === 401) return 'Authentication required';
        if (context.statusCode === 403) return 'Access forbidden';
        if (context.statusCode === 500) return 'Server error occurred';
        if (context.statusCode >= 400 && context.statusCode < 500) return 'Client request error';
        if (context.statusCode >= 500) return 'Server error';
      }
    }

    return friendlyMessage;
  }

  private extractResourceFromUrl(url: string): string | null {
    // Extract meaningful resource names from API URLs
    const patterns = [
      { pattern: /\/api\/characters/, resource: 'character data' },
      { pattern: /\/api\/swimsuits/, resource: 'swimsuit data' },
      { pattern: /\/api\/skills/, resource: 'skill data' },
      { pattern: /\/api\/items/, resource: 'item data' },
      { pattern: /\/api\/episodes/, resource: 'episode data' },
      { pattern: /\/api\/documents/, resource: 'document data' },
      { pattern: /\/api\/update-logs/, resource: 'update logs' },
      { pattern: /\/api\/events/, resource: 'event data' },
      { pattern: /\/api\/bromides/, resource: 'bromide data' },
      { pattern: /\/api\/gachas/, resource: 'gacha data' },
      { pattern: /\/api\/shop-listings/, resource: 'shop data' },
      { pattern: /\/api\/upload/, resource: 'file upload' },
      { pattern: /\/api\/images/, resource: 'image data' },
      { pattern: /\/api\/dashboard/, resource: 'dashboard data' },
      { pattern: /\/api\/health/, resource: 'health check' }
    ];

    for (const { pattern, resource } of patterns) {
      if (pattern.test(url)) {
        return resource;
      }
    }

    return null;
  }

  // ============================================================================
  // ENHANCED FORMATTING UTILITIES
  // ============================================================================

  private formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);

    switch (this.config.timestampFormat) {
      case 'time-only':
        return date.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      case 'short':
        return date.toLocaleString('en-US', {
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }).replace(',', '');
      case 'iso':
      default:
        return timestamp;
    }
  }

  private colorize(text: string, color: string): string {
    if (!this.config.enableColors) return text;
    return `${color}${text}${COLORS.reset}`;
  }

  private formatMeta(meta: any): string {
    if (!meta) return '';

    try {
      let formatted: string;

      if (typeof meta === 'string') {
        formatted = meta;
      } else if (meta instanceof Error) {
        formatted = `${meta.name}: ${meta.message}`;
      } else if (typeof meta === 'object') {
        formatted = JSON.stringify(meta, null, this.config.enableIndentation ? 2 : 0);
      } else {
        formatted = String(meta);
      }

      // Truncate if too long
      if (formatted.length > this.config.maxMetaLength) {
        formatted = formatted.substring(0, this.config.maxMetaLength) + '...';
      }

      return formatted;
    } catch {
      return '[object]';
    }
  }

  private formatStackTrace(stack: string): string {
    if (!stack) return '';

    const lines = stack.split('\n');
    const formattedLines = lines.map((line, index) => {
      if (index === 0) {
        // Error message line
        return this.colorize(line, COLORS.error_detail);
      } else {
        // Stack trace lines
        const indent = this.config.enableIndentation ? '    ' : '  ';
        const cleanLine = line.trim();

        if (cleanLine.includes('node_modules')) {
          return this.colorize(`${indent}${cleanLine}`, COLORS.dim);
        } else {
          return this.colorize(`${indent}${cleanLine}`, COLORS.context);
        }
      }
    });

    return formattedLines.join('\n');
  }

  private getLogSymbol(level: LogLevel): string {
    if (!this.config.enableSymbols) return '';
    return SYMBOLS[level] || '';
  }

  private formatContextInfo(context: LogEntry['context']): string {
    if (!context) return '';

    const parts: string[] = [];

    // Request ID (most important)
    if (context.requestId) {
      parts.push(this.colorize(`req:${context.requestId}`, COLORS.context));
    }

    // HTTP method and URL
    if (context.method && context.url) {
      const methodColor = context.method === 'GET' ? COLORS.success :
                         context.method === 'POST' ? COLORS.info :
                         context.method === 'PUT' ? COLORS.warn :
                         context.method === 'DELETE' ? COLORS.error : COLORS.message;
      parts.push(this.colorize(`${context.method}`, methodColor) + ` ${context.url}`);
    }

    // Status code with color coding
    if (context.statusCode) {
      const statusColor = context.statusCode < 300 ? COLORS.success :
                         context.statusCode < 400 ? COLORS.info :
                         context.statusCode < 500 ? COLORS.warn : COLORS.error;
      parts.push(this.colorize(`${context.statusCode}`, statusColor));
    }

    // Duration with performance indicators
    if (context.duration !== undefined) {
      const durationColor = context.duration < 100 ? COLORS.success :
                           context.duration < 500 ? COLORS.warn : COLORS.error;
      const perfSymbol = context.duration < 100 ? '⚡' :
                        context.duration < 500 ? '⏱️ ' : '🐌';
      parts.push(this.colorize(`${perfSymbol}${context.duration}ms`, durationColor));
    }

    // User ID
    if (context.userId) {
      parts.push(this.colorize(`user:${context.userId}`, COLORS.meta));
    }

    // IP address
    if (context.ip) {
      parts.push(this.colorize(`ip:${context.ip}`, COLORS.dim));
    }

    return parts.length > 0 ? `[${parts.join(' | ')}]` : '';
  }

  private formatBusinessFriendlyMessage(entry: LogEntry): string {
    const { level, timestamp, message, context, error } = entry;

    // Translate message to business-friendly language
    const friendlyMessage = this.translateToBusinessFriendly(message, level, context);

    // Build simplified output
    const parts: string[] = [];

    // 1. Simple timestamp (time only)
    const time = new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    parts.push(this.colorize(`[${time}]`, COLORS.timestamp));

    // 2. Simple status indicator
    const statusIndicator = level === 'error' ? '❌' :
                           level === 'warn' ? '⚠️' :
                           level === 'info' ? '✅' : 'ℹ️';
    parts.push(statusIndicator);

    // 3. Simplified message
    parts.push(this.colorize(friendlyMessage, COLORS.message));

    // 4. Essential context only
    const essentialInfo: string[] = [];

    if (context?.duration) {
      const duration = context.duration;
      const durationText = duration < 100 ? `${duration}ms` :
                          duration < 1000 ? `${duration}ms (good)` :
                          duration < 5000 ? `${duration}ms (slow)` : `${duration}ms (very slow)`;
      const durationColor = duration < 100 ? COLORS.success :
                           duration < 1000 ? COLORS.info :
                           duration < 5000 ? COLORS.warn : COLORS.error;
      essentialInfo.push(this.colorize(durationText, durationColor));
    }

    if (context?.statusCode && context.statusCode >= 400) {
      const statusColor = context.statusCode < 500 ? COLORS.warn : COLORS.error;
      essentialInfo.push(this.colorize(`Status: ${context.statusCode}`, statusColor));
    }

    if (essentialInfo.length > 0) {
      parts.push(`(${essentialInfo.join(', ')})`);
    }

    // 5. Simple error message (no stack trace)
    if (error && !this.config.hideStackTraces) {
      const errorMsg = error.message.length > 100 ?
        error.message.substring(0, 100) + '...' :
        error.message;
      parts.push(`- ${this.colorize(errorMsg, COLORS.error_detail)}`);
    }

    return parts.join(' ');
  }

  private formatConsoleMessage(entry: LogEntry): string {
    // Use business-friendly format if enabled
    if (this.config.businessFriendlyConsole) {
      return this.formatBusinessFriendlyMessage(entry);
    }

    const { level, timestamp, message, meta, context, error } = entry;

    // Build the main log line
    const parts: string[] = [];

    // 1. Timestamp
    const formattedTimestamp = this.formatTimestamp(timestamp);
    parts.push(this.colorize(`[${formattedTimestamp}]`, COLORS.timestamp));

    // 2. Log level with symbol and color
    const symbol = this.getLogSymbol(level);
    const levelText = level.toUpperCase().padEnd(5);
    const coloredLevel = this.colorize(`${symbol}${levelText}`, COLORS[level] + COLORS.bold);
    parts.push(coloredLevel);

    // 3. Main message
    const coloredMessage = this.colorize(message, COLORS.message);
    parts.push(coloredMessage);

    // Build the main line
    let output = parts.join(' ');

    // 4. Context information on the same line (compact) or new line (detailed)
    const contextInfo = this.formatContextInfo(context);
    if (contextInfo && !this.config.hideTechnicalDetails) {
      if (this.config.compactMode) {
        output += ` ${contextInfo}`;
      } else {
        output += `\n  ${this.colorize('Context:', COLORS.dim)} ${contextInfo}`;
      }
    }

    // 5. Meta information (always on new line if present and not compact)
    if (meta && !this.config.hideTechnicalDetails) {
      const formattedMeta = this.formatMeta(meta);
      if (formattedMeta) {
        if (this.config.compactMode) {
          output += ` ${this.colorize('meta:', COLORS.meta)}${formattedMeta}`;
        } else {
          const metaLines = formattedMeta.split('\n');
          if (metaLines.length === 1) {
            output += `\n  ${this.colorize('Meta:', COLORS.dim)} ${this.colorize(formattedMeta, COLORS.meta)}`;
          } else {
            output += `\n  ${this.colorize('Meta:', COLORS.dim)}`;
            metaLines.forEach(line => {
              output += `\n    ${this.colorize(line, COLORS.meta)}`;
            });
          }
        }
      }
    }

    // 6. Error information (always detailed)
    if (error) {
      if (this.config.compactMode || this.config.hideStackTraces) {
        output += `\n  ${this.colorize('Error:', COLORS.error)} ${this.colorize(error.message, COLORS.error_detail)}`;
      } else {
        output += `\n  ${this.colorize('Error:', COLORS.error)} ${this.colorize(error.message, COLORS.error_detail)}`;

        if (error.stack && level === 'error' && !this.config.hideStackTraces) {
          output += `\n  ${this.colorize('Stack:', COLORS.dim)}`;
          output += `\n${this.formatStackTrace(error.stack)}`;
        }
      }
    }

    // 7. Add separator for errors in non-compact mode
    if (!this.config.compactMode && this.config.enableSeparators && level === 'error') {
      output += `\n${this.colorize(SYMBOLS.separator, COLORS.dim)}`;
    }

    return output;
  }

  private formatFileMessage(entry: LogEntry): string {
    if (this.config.enableJson) {
      return JSON.stringify(entry);
    }
    return this.formatConsoleMessage(entry);
  }

  private log(level: LogLevel, message: string, meta?: any, context?: LogEntry['context']): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: this.getTimestamp(),
      ...(meta && { meta }),
      ...(context && { context }),
      ...(meta instanceof Error && {
        error: {
          name: meta.name,
          message: meta.message,
          stack: meta.stack
        }
      })
    };

    // Store in buffer
    this.logBuffer.push(entry);
    if (this.logBuffer.length > 1000) {
      this.logBuffer = this.logBuffer.slice(-500); // Keep last 500 entries
    }

    // Console output
    if (this.config.enableConsole) {
      const formattedMessage = this.formatConsoleMessage(entry);
      if (level === 'error') {
        console.error(formattedMessage);
      } else if (level === 'warn') {
        console.warn(formattedMessage);
      } else {
        console.log(formattedMessage);
      }
    }

    // File output
    if (this.config.enableFile && this.writeStream) {
      const fileMessage = this.formatFileMessage(entry) + '\n';
      this.writeStream.write(fileMessage);
    }
  }

  // ============================================================================
  // PUBLIC LOGGING METHODS
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

  // HTTP request logging with enhanced formatting
  logRequest(req: any, res: any, duration: number): void {
    const level = res.statusCode >= 400 ? 'warn' : 'info';

    // Create a more descriptive message for HTTP requests
    const statusEmoji = res.statusCode < 300 ? '✅' :
                       res.statusCode < 400 ? '📄' :
                       res.statusCode < 500 ? '⚠️' : '❌';

    const message = `${SYMBOLS.response} HTTP Request Completed ${statusEmoji}`;

    this.log(level, message, null, {
      requestId: req.id,
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent')
    });
  }

  // Enhanced logging methods for specific scenarios
  logApiRequest(req: any): void {
    const message = `${SYMBOLS.request} Incoming API Request`;
    this.info(message, null, {
      requestId: req.id,
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent')
    });
  }

  logDatabaseQuery(query: string, duration?: number, error?: Error): void {
    const level = error ? 'error' : duration && duration > 1000 ? 'warn' : 'debug';
    const message = `${SYMBOLS.database} Database Query ${error ? 'Failed' : 'Executed'}`;

    const meta = {
      query: query.length > 100 ? query.substring(0, 100) + '...' : query,
      ...(duration && { duration }),
      ...(error && { error: error.message })
    };

    this.log(level, message, meta);
  }

  logSecurity(event: string, details: any): void {
    const message = `${SYMBOLS.security} Security Event: ${event}`;
    this.warn(message, details);
  }

  logPerformance(operation: string, duration: number, threshold: number = 1000): void {
    const level = duration > threshold ? 'warn' : 'info';
    const message = `${SYMBOLS.performance} Performance: ${operation}`;

    this.log(level, message, {
      duration,
      threshold,
      status: duration > threshold ? 'slow' : 'normal'
    });
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logBuffer.slice(-count);
  }

  getLogsByLevel(level: LogLevel, count: number = 100): LogEntry[] {
    return this.logBuffer
      .filter(entry => entry.level === level)
      .slice(-count);
  }

  // Enhanced utility methods for better development experience
  logSeparator(title?: string): void {
    if (!this.config.enableSeparators) return;

    if (title) {
      const titleLength = title.length;
      const separatorLength = Math.max(60, titleLength + 20);
      const padding = Math.floor((separatorLength - titleLength - 2) / 2);
      const leftPad = '─'.repeat(padding);
      const rightPad = '─'.repeat(separatorLength - titleLength - 2 - padding);

      const separator = `${leftPad} ${title} ${rightPad}`;
      console.log(this.colorize(separator, COLORS.dim));
    } else {
      console.log(this.colorize(SYMBOLS.separator, COLORS.dim));
    }
  }

  logStartup(appName: string, version: string, port: number): void {
    this.logSeparator('APPLICATION STARTUP');
    this.info(`🚀 ${appName} v${version} starting up...`);
    this.info(`🌐 Server will be available at http://localhost:${port}`);
    this.info(`📝 Log level: ${this.config.level.toUpperCase()}`);
    this.info(`🎨 Enhanced formatting: ${this.config.enableColors ? 'enabled' : 'disabled'}`);
    this.logSeparator();
  }

  logShutdown(appName: string): void {
    this.logSeparator('APPLICATION SHUTDOWN');
    this.info(`👋 ${appName} shutting down gracefully...`);
    this.logSeparator();
  }

  // Development helper methods
  logDebugObject(label: string, obj: any): void {
    if (this.config.level !== 'debug') return;

    this.debug(`🔍 ${label}:`, obj);
  }

  logTiming(label: string, startTime: number): void {
    const duration = Date.now() - startTime;
    this.logPerformance(label, duration);
  }

  // Configuration management
  setLogLevel(level: LogLevel): void {
    this.config.level = level;
    this.info(`📊 Log level changed to: ${level.toUpperCase()}`);
  }

  getConfig(): LoggerConfig {
    return { ...this.config };
  }

  // Enhanced configuration methods
  updateConfig(updates: Partial<LoggerConfig>): void {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...updates };

    this.info('⚙️  Logger configuration updated', {
      changes: Object.keys(updates),
      oldValues: Object.keys(updates).reduce((acc, key) => {
        acc[key] = oldConfig[key as keyof LoggerConfig];
        return acc;
      }, {} as any),
      newValues: updates
    });
  }

  // Business-friendly mode convenience methods
  enableBusinessFriendlyMode(): void {
    this.updateConfig({
      businessFriendlyConsole: true,
      hideStackTraces: true,
      hideTechnicalDetails: true,
      simplifyMessages: true,
      compactMode: true,
      enableSeparators: false
    });
    this.info('📊 Business-friendly console mode enabled');
  }

  enableDeveloperMode(): void {
    this.updateConfig({
      businessFriendlyConsole: false,
      hideStackTraces: false,
      hideTechnicalDetails: false,
      simplifyMessages: false,
      compactMode: false,
      enableSeparators: true
    });
    this.info('🔧 Developer console mode enabled');
  }

  toggleBusinessMode(): void {
    if (this.config.businessFriendlyConsole) {
      this.enableDeveloperMode();
    } else {
      this.enableBusinessFriendlyMode();
    }
  }

  getLogSummary(minutes: number = 60): any {
    const cutoffTime = Date.now() - (minutes * 60 * 1000);
    const recentLogs = this.logBuffer.filter(entry =>
      new Date(entry.timestamp).getTime() > cutoffTime
    );

    const summary = {
      timeRange: `Last ${minutes} minutes`,
      totalLogs: recentLogs.length,
      byLevel: {
        debug: recentLogs.filter(l => l.level === 'debug').length,
        info: recentLogs.filter(l => l.level === 'info').length,
        warn: recentLogs.filter(l => l.level === 'warn').length,
        error: recentLogs.filter(l => l.level === 'error').length
      },
      errors: recentLogs.filter(l => l.level === 'error').map(l => ({
        timestamp: l.timestamp,
        message: l.message,
        error: l.error?.message
      })),
      performance: {
        slowRequests: recentLogs.filter(l =>
          l.context?.duration && l.context.duration > 1000
        ).length,
        averageResponseTime: this.calculateAverageResponseTime(recentLogs)
      }
    };

    return summary;
  }

  private calculateAverageResponseTime(logs: LogEntry[]): number {
    const requestLogs = logs.filter(l => l.context?.duration);
    if (requestLogs.length === 0) return 0;

    const totalTime = requestLogs.reduce((sum, log) => sum + (log.context?.duration || 0), 0);
    return Math.round(totalTime / requestLogs.length);
  }

  logSummary(minutes: number = 60): void {
    const summary = this.getLogSummary(minutes);

    this.logSeparator('LOG SUMMARY');
    this.info(`📊 ${summary.timeRange}: ${summary.totalLogs} total logs`);
    this.info(`📈 Breakdown: ${summary.byLevel.debug}D ${summary.byLevel.info}I ${summary.byLevel.warn}W ${summary.byLevel.error}E`);

    if (summary.errors.length > 0) {
      this.warn(`❌ ${summary.errors.length} errors in the last ${minutes} minutes`);
    }

    if (summary.performance.slowRequests > 0) {
      this.warn(`🐌 ${summary.performance.slowRequests} slow requests (>1s)`);
    }

    if (summary.performance.averageResponseTime > 0) {
      this.info(`⚡ Average response time: ${summary.performance.averageResponseTime}ms`);
    }

    this.logSeparator();
  }

  // Graceful shutdown
  async flush(): Promise<void> {
    return new Promise((resolve) => {
      if (this.writeStream) {
        this.writeStream.end(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async shutdown(): Promise<void> {
    this.info('Logger shutting down...');
    await this.flush();
    if (this.writeStream) {
      this.writeStream.destroy();
      this.writeStream = null;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

const logger = new EnhancedLogger(config);

// Auto-enable business-friendly mode if environment variable is set
if (process.env.LOG_BUSINESS_FRIENDLY === 'true') {
  logger.enableBusinessFriendlyMode();
}

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Enable business-friendly console logging
 * Simplifies messages, hides technical details, and makes output suitable for non-technical users
 */
export const enableBusinessFriendlyLogging = (): void => {
  logger.enableBusinessFriendlyMode();
};

/**
 * Enable developer-friendly console logging
 * Shows full technical details, stack traces, and debugging information
 */
export const enableDeveloperLogging = (): void => {
  logger.enableDeveloperMode();
};

/**
 * Toggle between business-friendly and developer modes
 */
export const toggleLoggingMode = (): void => {
  logger.toggleBusinessMode();
};

/**
 * Check if business-friendly mode is currently enabled
 */
export const isBusinessFriendlyMode = (): boolean => {
  return logger.getConfig().businessFriendlyConsole;
};

// ============================================================================
// EXPORTS
// ============================================================================

export default logger;