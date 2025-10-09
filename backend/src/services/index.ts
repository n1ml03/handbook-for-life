/**
 * Service Registry
 * Central registry for all services with health check capabilities
 */

import logger from '../config/logger';
import { CacheService } from './CacheService';

interface ServiceHealth {
  name: string;
  status: 'healthy' | 'unhealthy';
  errors: string[];
}

interface HealthCheckResult {
  isHealthy: boolean;
  services: ServiceHealth[];
}

class ServiceRegistry {
  private services: Map<string, any>;

  constructor() {
    this.services = new Map();
    this.registerDefaultServices();
  }

  /**
   * Register default services
   */
  private registerDefaultServices(): void {
    this.register('cache', CacheService);
  }

  /**
   * Register a service
   */
  register(name: string, service: any): void {
    this.services.set(name, service);
    logger.debug(`Service registered: ${name}`);
  }

  /**
   * Get a service by name
   */
  get(name: string): any {
    return this.services.get(name);
  }

  /**
   * Perform health check on all services
   */
  async performHealthCheck(): Promise<HealthCheckResult> {
    const serviceHealths: ServiceHealth[] = [];
    let allHealthy = true;

    for (const [name, service] of this.services.entries()) {
      const health: ServiceHealth = {
        name,
        status: 'healthy',
        errors: []
      };

      try {
        // Check if service has a health check method
        if (typeof service.healthCheck === 'function') {
          const isHealthy = await service.healthCheck();
          if (!isHealthy) {
            health.status = 'unhealthy';
            health.errors.push('Health check failed');
            allHealthy = false;
          }
        } else {
          // If no health check method, just verify service exists
          if (!service) {
            health.status = 'unhealthy';
            health.errors.push('Service not initialized');
            allHealthy = false;
          }
        }
      } catch (error: any) {
        health.status = 'unhealthy';
        health.errors.push(error.message || 'Unknown error');
        allHealthy = false;
        logger.error(`Health check failed for service ${name}:`, error);
      }

      serviceHealths.push(health);
    }

    return {
      isHealthy: allHealthy,
      services: serviceHealths
    };
  }

  /**
   * Shutdown all services
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down all services...');

    for (const [name, service] of this.services.entries()) {
      try {
        if (typeof service.shutdown === 'function') {
          await service.shutdown();
          logger.info(`Service ${name} shut down successfully`);
        }
      } catch (error: any) {
        logger.error(`Error shutting down service ${name}:`, error);
      }
    }

    this.services.clear();
  }
}

// Export singleton instance
export const serviceRegistry = new ServiceRegistry();

// Export individual services for convenience
export { CacheService } from './CacheService';
export { UpdateLogService, DocumentService, GachaService } from './services';

