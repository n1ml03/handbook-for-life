/**
 * Swagger/OpenAPI configuration for API documentation
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DOAXVV Handbook API',
      version: '2.0.0',
      description: 'A comprehensive API for managing DOAXVV game data including characters, swimsuits, skills, items, events, and more.',
      contact: {
        name: 'API Support',
        email: 'support@example.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Development server'
      },
      {
        url: 'http://{host}:3001',
        description: 'Network server',
        variables: {
          host: {
            default: 'localhost',
            description: 'Server hostname or IP address'
          }
        }
      }
    ],
    tags: [
      { name: 'Health', description: 'Health check endpoints' },
      { name: 'Characters', description: 'Character management' },
      { name: 'Swimsuits', description: 'Swimsuit management' },
      { name: 'Skills', description: 'Skill management' },
      { name: 'Items', description: 'Item management' },
      { name: 'Episodes', description: 'Episode management' },
      { name: 'Events', description: 'Event management' },
      { name: 'Bromides', description: 'Bromide management' },
      { name: 'Gachas', description: 'Gacha management' },
      { name: 'Documents', description: 'Documentation management' },
      { name: 'Update Logs', description: 'Update log management' },
      { name: 'Dashboard', description: 'Dashboard and analytics' }
    ],
    components: {
      schemas: {
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              example: 'Error message'
            },
            errorId: {
              type: 'string',
              example: 'err_abc123'
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'array',
              items: {}
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 },
                total: { type: 'number', example: 100 },
                totalPages: { type: 'number', example: 10 },
                hasNext: { type: 'boolean', example: true },
                hasPrev: { type: 'boolean', example: false }
              }
            },
            timestamp: {
              type: 'string',
              format: 'date-time'
            }
          }
        }
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number',
          schema: {
            type: 'integer',
            minimum: 1,
            default: 1
          }
        },
        LimitParam: {
          name: 'limit',
          in: 'query',
          description: 'Number of items per page',
          schema: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            default: 10
          }
        },
        SortByParam: {
          name: 'sortBy',
          in: 'query',
          description: 'Field to sort by',
          schema: {
            type: 'string',
            default: 'id'
          }
        },
        SortOrderParam: {
          name: 'sortOrder',
          in: 'query',
          description: 'Sort order',
          schema: {
            type: 'string',
            enum: ['ASC', 'DESC', 'asc', 'desc'],
            default: 'ASC'
          }
        },
        SearchParam: {
          name: 'search',
          in: 'query',
          description: 'Search query',
          schema: {
            type: 'string'
          }
        }
      },
      responses: {
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse'
              }
            }
          }
        },
        PaginatedSuccess: {
          description: 'Paginated response',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/PaginatedResponse'
              }
            }
          }
        }
      }
    }
  },
  apis: ['./src/routes/*.ts', './src/server.ts']
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };

