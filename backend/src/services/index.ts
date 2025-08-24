import { CharacterService } from './CharacterService';
import { BromideService } from './BromideService';
import { SwimsuitService } from './SwimsuitService';
import { SkillService } from './SkillService';
import { ItemService } from './ItemService';
import { EventService } from './EventService';
import { EpisodeService } from './EpisodeService';
import { DocumentService } from './DocumentService';
import { GachaService } from './GachaService';
import { ShopService } from './ShopService';
import { SwimsuitSkillService } from './SwimsuitSkillService';
import { DatabaseService } from './DatabaseService';
import { UpdateLogService } from './UpdateLogService';
import { logger } from '../config';
import { ServiceHealthStatus } from './BaseService';

// ============================================================================
// SERVICE INSTANCES
// ============================================================================

export const databaseService = new DatabaseService();
export const characterService = new CharacterService();
export const bromideService = new BromideService();
export const swimsuitService = new SwimsuitService();
export const skillService = new SkillService();
export const itemService = new ItemService();
export const eventService = new EventService();
export const episodeService = new EpisodeService();
export const documentService = new DocumentService();
export const gachaService = new GachaService();
export const shopService = new ShopService();
export const swimsuitSkillService = new SwimsuitSkillService();
export const updateLogService = new UpdateLogService();

// ============================================================================
// SERVICE TYPES AND INTERFACES
// ============================================================================

// Using ServiceHealthStatus from BaseService to avoid duplication

export interface SystemHealthStatus {
  isHealthy: boolean;
  services: ServiceHealthStatus[];
  timestamp: string;
  systemInfo: {
    nodeVersion: string;
    platform: string;
    memory: {
      used: string;
      total: string;
    };
    uptime: string;
  };
}

export interface ServiceDependency {
  name: string;
  required: boolean;
  initialized: boolean;
}

// ============================================================================
// SERVICE REGISTRY CLASS
// ============================================================================

class ServiceRegistry {
  private services: Map<string, any> = new Map();
  private dependencies: Map<string, ServiceDependency[]> = new Map();
  private initializationOrder: string[] = [];
  private isInitialized: boolean = false;

  constructor() {
    this.registerServices();
    this.defineDependencies();
    this.calculateInitializationOrder();
  }

  private registerServices(): void {
    this.services.set('database', databaseService);
    this.services.set('character', characterService);
    this.services.set('bromide', bromideService);
    this.services.set('swimsuit', swimsuitService);
    this.services.set('skill', skillService);
    this.services.set('item', itemService);
    this.services.set('event', eventService);
    this.services.set('episode', episodeService);
    this.services.set('document', documentService);
    this.services.set('gacha', gachaService);
    this.services.set('shop', shopService);
    this.services.set('swimsuitSkill', swimsuitSkillService);
    this.services.set('updateLog', updateLogService);
  }

  private defineDependencies(): void {
    // Database service has no dependencies
    this.dependencies.set('database', []);

    // Most services depend on database
    const databaseDependency: ServiceDependency = {
      name: 'database',
      required: true,
      initialized: false
    };

    this.dependencies.set('character', [databaseDependency]);
    this.dependencies.set('bromide', [databaseDependency]);
    this.dependencies.set('swimsuit', [databaseDependency]);
    this.dependencies.set('skill', [databaseDependency]);
    this.dependencies.set('item', [databaseDependency]);
    this.dependencies.set('event', [databaseDependency]);
    this.dependencies.set('episode', [databaseDependency]);
    this.dependencies.set('document', [databaseDependency]);
    this.dependencies.set('gacha', [databaseDependency]);
    this.dependencies.set('shop', [databaseDependency]);
    this.dependencies.set('updateLog', [databaseDependency]);

    // SwimsuitSkill service depends on swimsuit and skill services
    this.dependencies.set('swimsuitSkill', [
      databaseDependency,
      { name: 'swimsuit', required: true, initialized: false },
      { name: 'skill', required: true, initialized: false }
    ]);
  }

  private calculateInitializationOrder(): void {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (serviceName: string) => {
      if (visiting.has(serviceName)) {
        throw new Error(`Circular dependency detected involving service: ${serviceName}`);
      }

      if (visited.has(serviceName)) {
        return;
      }

      visiting.add(serviceName);

      const deps = this.dependencies.get(serviceName) || [];
      for (const dep of deps) {
        if (dep.required) {
          visit(dep.name);
        }
      }

      visiting.delete(serviceName);
      visited.add(serviceName);
      order.push(serviceName);
    };

    for (const serviceName of this.services.keys()) {
      visit(serviceName);
    }

    this.initializationOrder = order;
  }

  getService<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service '${serviceName}' not found. Available services: ${Array.from(this.services.keys()).join(', ')}`);
    }

    if (!this.isInitialized) {
      logger.warn(`Accessing service '${serviceName}' before initialization is complete`);
    }

    return service as T;
  }

  getAllServices(): Map<string, any> {
    return new Map(this.services);
  }

  getServiceDependencies(serviceName: string): ServiceDependency[] {
    return this.dependencies.get(serviceName) || [];
  }

  getInitializationOrder(): string[] {
    return [...this.initializationOrder];
  }

  isServiceInitialized(): boolean {
    return this.isInitialized;
  }

  async performHealthCheck(): Promise<SystemHealthStatus> {
    const serviceHealthStatuses: ServiceHealthStatus[] = [];
    let systemIsHealthy = true;

    for (const [serviceName, service] of this.services.entries()) {
      try {
        if (service.healthCheck && typeof service.healthCheck === 'function') {
          const healthStatus = await service.healthCheck();
          serviceHealthStatuses.push({
            serviceName,
            isHealthy: healthStatus.isHealthy,
            errors: healthStatus.errors || [],
            warnings: healthStatus.warnings || [],
            responseTime: healthStatus.responseTime,
            timestamp: healthStatus.timestamp,
            version: healthStatus.version,
            dependencies: healthStatus.dependencies
          });

          if (!healthStatus.isHealthy) {
            systemIsHealthy = false;
          }
        } else {
          serviceHealthStatuses.push({
            serviceName,
            isHealthy: true,
            errors: [],
            warnings: ['Health check not implemented'],
            responseTime: 0,
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            dependencies: {}
          });
        }
      } catch (error) {
        systemIsHealthy = false;
        serviceHealthStatuses.push({
          serviceName,
          isHealthy: false,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          warnings: [],
          responseTime: 0,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          dependencies: {}
        });
      }
    }

    // Get system information
    const memoryUsage = process.memoryUsage();
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      memory: {
        used: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB',
        total: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB'
      },
      uptime: Math.round(process.uptime()) + 's'
    };

    return {
      isHealthy: systemIsHealthy,
      services: serviceHealthStatuses,
      timestamp: new Date().toISOString(),
      systemInfo
    };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      logger.warn('Services already initialized');
      return;
    }

    logger.info('Initializing services...', { 
      order: this.initializationOrder,
      total: this.services.size 
    });

    let initializedCount = 0;
    
    for (const serviceName of this.initializationOrder) {
      try {
        const service = this.services.get(serviceName);
        
        if (service && typeof service.initialize === 'function') {
          logger.info(`Initializing service: ${serviceName}`);
          await service.initialize();
          logger.info(`Service initialized successfully: ${serviceName}`);
        } else {
          logger.info(`Service ${serviceName} does not require initialization`);
        }
        
        // Mark dependencies as initialized
        const deps = this.dependencies.get(serviceName) || [];
        deps.forEach(dep => {
          if (dep.name === serviceName) {
            dep.initialized = true;
          }
        });
        
        initializedCount++;
        
      } catch (error) {
        logger.error(`Failed to initialize service: ${serviceName}`, error);
        throw new Error(`Service initialization failed: ${serviceName} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    this.isInitialized = true;
    logger.info(`All services initialized successfully (${initializedCount}/${this.services.size})`);
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      logger.warn('Services not initialized, skipping shutdown');
      return;
    }

    logger.info('Shutting down services...');

    // Shutdown in reverse order
    const shutdownOrder = [...this.initializationOrder].reverse();
    let shutdownCount = 0;

    for (const serviceName of shutdownOrder) {
      try {
        const service = this.services.get(serviceName);
        
        if (service && typeof service.shutdown === 'function') {
          logger.info(`Shutting down service: ${serviceName}`);
          await service.shutdown();
          logger.info(`Service shut down successfully: ${serviceName}`);
        }
        
        shutdownCount++;
        
      } catch (error) {
        logger.error(`Failed to shutdown service: ${serviceName}`, error);
        // Continue with other services even if one fails
      }
    }

    this.isInitialized = false;
    logger.info(`Services shutdown completed (${shutdownCount}/${this.services.size})`);
  }
}

// ============================================================================
// GLOBAL SERVICE REGISTRY INSTANCE
// ============================================================================

export const serviceRegistry = new ServiceRegistry();

// ============================================================================
// CONVENIENCE EXPORTS
// ============================================================================

export {
  CharacterService,
  BromideService,
  SwimsuitService,
  SkillService,
  ItemService,
  EventService,
  EpisodeService,
  DocumentService,
  GachaService,
  ShopService,
  SwimsuitSkillService,
  DatabaseService,
  UpdateLogService
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default serviceRegistry;

// Service Factory Pattern for efficient service management
export class ServiceFactory {
  private static instance: ServiceFactory;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.initializeServices();
  }

  public static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  private initializeServices(): void {
    // Initialize all services as singletons
    this.services.set('character', new CharacterService());
    this.services.set('document', new DocumentService());
    this.services.set('swimsuit', new SwimsuitService());
    this.services.set('skill', new SkillService());
    this.services.set('item', new ItemService());
    this.services.set('bromide', new BromideService());
    this.services.set('episode', new EpisodeService());
    this.services.set('event', new EventService());
    this.services.set('gacha', new GachaService());
    this.services.set('shop', new ShopService());
    this.services.set('updateLog', new UpdateLogService());
    this.services.set('swimsuitSkill', new SwimsuitSkillService());
  }

  public getService<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service '${serviceName}' not found`);
    }
    return service as T;
  }

  public getAllServices(): Map<string, any> {
    return new Map(this.services);
  }

  // Centralized health check for all services
  public async getSystemHealthCheck(): Promise<{
    isHealthy: boolean;
    services: ServiceHealthStatus[];
    summary: {
      total: number;
      healthy: number;
      unhealthy: number;
      averageResponseTime: number;
    };
    timestamp: string;
  }> {
    const startTime = Date.now();
    const serviceHealthChecks: ServiceHealthStatus[] = [];
    
    // Run all health checks in parallel for better performance
    const healthCheckPromises = Array.from(this.services.entries()).map(async ([name, service]) => {
      try {
        if (typeof service.healthCheck === 'function') {
          return await service.healthCheck();
        }
        return {
          serviceName: name,
          isHealthy: true,
          errors: [],
          warnings: [],
          responseTime: 0,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          dependencies: {},
        };
      } catch (error) {
        return {
          serviceName: name,
          isHealthy: false,
          errors: [`Health check failed: ${error}`],
          warnings: [],
          responseTime: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          dependencies: {},
        };
      }
    });

    const results = await Promise.all(healthCheckPromises);
    serviceHealthChecks.push(...results);

    const healthy = serviceHealthChecks.filter(s => s.isHealthy).length;
    const unhealthy = serviceHealthChecks.length - healthy;
    const averageResponseTime = serviceHealthChecks.reduce((sum, s) => sum + s.responseTime, 0) / serviceHealthChecks.length;

    return {
      isHealthy: unhealthy === 0,
      services: serviceHealthChecks,
      summary: {
        total: serviceHealthChecks.length,
        healthy,
        unhealthy,
        averageResponseTime,
      },
      timestamp: new Date().toISOString(),
    };
  }

  // Get performance metrics from all services
  public getSystemPerformanceMetrics(): {
    serviceName: string;
    metrics: any[];
  }[] {
    return Array.from(this.services.entries()).map(([name, service]) => {
      return {
        serviceName: name,
        metrics: typeof service.getPerformanceMetrics === 'function' 
          ? service.getPerformanceMetrics() 
          : [],
      };
    });
  }
}

// Service factory for advanced usage
export const serviceFactory = ServiceFactory.getInstance(); 