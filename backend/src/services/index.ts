import { CharacterService, characterService } from './CharacterService';
import { BromideService, bromideService } from './BromideService';
import { SwimsuitService, swimsuitService } from './SwimsuitService';
import { SkillService, skillService } from './SkillService';
import { ItemService, itemService } from './ItemService';
import { EventService, eventService } from './EventService';
import { EpisodeService, episodeService } from './EpisodeService';
import { DocumentService, documentService } from './DocumentService';
import { GachaService, gachaService } from './GachaService';
import { ShopService, shopService } from './ShopService';
import { SwimsuitSkillService, swimsuitSkillService } from './SwimsuitSkillService';
import { DatabaseService, databaseService } from './DatabaseService';
import { UpdateLogService, updateLogService } from './UpdateLogService';
import { logger } from '../config';

export interface ServiceHealthStatus {
  serviceName: string;
  isHealthy: boolean;
  errors: string[];
  warnings?: string[];
  responseTime?: number;
  timestamp?: string;
  version?: string;
  dependencies?: Record<string, string>;
}

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
            warnings: ['Health check not implemented']
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        serviceHealthStatuses.push({
          serviceName,
          isHealthy: false,
          errors: [errorMessage],
          warnings: []
        });
        systemIsHealthy = false;
        logger.error(`Health check failed for service: ${serviceName}`, { error: errorMessage });
      }
    }

    const memoryUsage = process.memoryUsage();

    return {
      isHealthy: systemIsHealthy,
      services: serviceHealthStatuses,
      timestamp: new Date().toISOString(),
      systemInfo: {
        nodeVersion: process.version,
        platform: process.platform,
        memory: {
          used: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`,
          total: `${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB`
        },
        uptime: `${Math.round(process.uptime())}s`
      }
    };
  }

  async initialize(): Promise<void> {
    logger.info('Initializing services in dependency order...', {
      order: this.initializationOrder
    });

    for (const serviceName of this.initializationOrder) {
      const service = this.services.get(serviceName);
      if (!service) {
        logger.warn(`Service not found during initialization: ${serviceName}`);
        continue;
      }

      try {
        // Check dependencies before initializing
        const deps = this.dependencies.get(serviceName) || [];
        for (const dep of deps) {
          if (dep.required && !dep.initialized) {
            throw new Error(`Required dependency '${dep.name}' is not initialized`);
          }
        }

        if (service.initialize && typeof service.initialize === 'function') {
          await service.initialize();
          logger.info(`Service initialized: ${serviceName}`);

          // Mark dependencies as initialized
          for (const [depServiceName, depList] of this.dependencies.entries()) {
            for (const dep of depList) {
              if (dep.name === serviceName) {
                dep.initialized = true;
              }
            }
          }
        } else {
          logger.debug(`Service ${serviceName} has no initialize method`);
        }
      } catch (error) {
        logger.error(`Failed to initialize service: ${serviceName}`, {
          error: error instanceof Error ? error.message : error
        });
        throw error;
      }
    }

    this.isInitialized = true;
    logger.info('All services initialized successfully');
  }

  async shutdown(): Promise<void> {
    logger.info('Shutting down services...');
    
    for (const [serviceName, service] of this.services.entries()) {
      try {
        if (service.shutdown && typeof service.shutdown === 'function') {
          await service.shutdown();
          logger.info(`Service shut down: ${serviceName}`);
        }
      } catch (error) {
        logger.error(`Failed to shut down service: ${serviceName}`, { 
          error: error instanceof Error ? error.message : error 
        });
      }
    }
    
    logger.info('All services shut down');
  }
}

// Export singleton instance
export const serviceRegistry = new ServiceRegistry();

// Export individual services for direct access
export {
  characterService,
  bromideService,
  swimsuitService,
  skillService,
  itemService,
  eventService,
  episodeService,
  documentService,
  gachaService,
  shopService,
  swimsuitSkillService,
  databaseService,
  updateLogService
};

export type {
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

// Export the service registry as default
export default serviceRegistry; 