import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DOAXVV Handbook API',
      version: '2.0.0',
      description: 'API server for DOAXVV Handbook - Comprehensive game data management system',
      contact: {
        name: 'API Support',
        email: 'support@doaxvv-handbook.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_BASE_URL || 'http://localhost:3001',
        description: 'Development server'
      }
    ],
    components: {
      schemas: {
        ApiSuccess: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            data: {
              type: 'object',
              description: 'Response data payload'
            },
            message: {
              type: 'string',
              description: 'Optional success message'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Response timestamp'
            }
          },
          required: ['success', 'data', 'timestamp']
        },
        ApiError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            error: {
              type: 'string',
              description: 'Error message'
            },
            message: {
              type: 'string',
              description: 'Additional error details'
            },
            details: {
              type: 'object',
              description: 'Error details object'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Error timestamp'
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code'
            }
          },
          required: ['success', 'error', 'timestamp']
        },
        PaginationInfo: {
          type: 'object',
          properties: {
            page: {
              type: 'integer',
              minimum: 1,
              description: 'Current page number'
            },
            limit: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              description: 'Items per page'
            },
            total: {
              type: 'integer',
              minimum: 0,
              description: 'Total number of items'
            },
            totalPages: {
              type: 'integer',
              minimum: 0,
              description: 'Total number of pages'
            },
            hasNext: {
              type: 'boolean',
              description: 'Whether there is a next page'
            },
            hasPrev: {
              type: 'boolean',
              description: 'Whether there is a previous page'
            }
          },
          required: ['page', 'limit', 'total', 'totalPages', 'hasNext', 'hasPrev']
        },
        PaginatedResponse: {
          allOf: [
            { $ref: '#/components/schemas/ApiSuccess' },
            {
              type: 'object',
              properties: {
                pagination: { $ref: '#/components/schemas/PaginationInfo' }
              },
              required: ['pagination']
            }
          ]
        },
        Character: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Character unique identifier'
            },
            unique_key: {
              type: 'string',
              description: 'Character unique key'
            },
            name_jp: {
              type: 'string',
              description: 'Character name in Japanese'
            },
            name_en: {
              type: 'string',
              description: 'Character name in English'
            },
            name_cn: {
              type: 'string',
              description: 'Character name in Chinese'
            },
            name_tw: {
              type: 'string',
              description: 'Character name in Traditional Chinese'
            },
            name_kr: {
              type: 'string',
              description: 'Character name in Korean'
            },
            birthday: {
              type: 'string',
              format: 'date',
              description: 'Character birthday'
            },
            height: {
              type: 'number',
              description: 'Character height in cm'
            },
            measurements: {
              type: 'string',
              description: 'Character measurements'
            },
            blood_type: {
              type: 'string',
              description: 'Character blood type'
            },
            voice_actor_jp: {
              type: 'string',
              description: 'Japanese voice actor name'
            },
            profile_image_url: {
              type: 'string',
              format: 'uri',
              description: 'Profile image URL'
            },
            is_active: {
              type: 'boolean',
              description: 'Whether character is active'
            }
          },
          required: ['id', 'unique_key', 'name_jp', 'name_en', 'is_active'],
          example: {
            id: 1,
            unique_key: 'kasumi',
            name_jp: 'かすみ',
            name_en: 'Kasumi',
            name_cn: '霞',
            name_tw: '霞',
            name_kr: '카스미',
            birthday: '1999-02-17',
            height: 158,
            measurements: 'B86-W54-H83',
            blood_type: 'A',
            voice_actor_jp: '桑島法子',
            profile_image_url: 'https://example.com/characters/kasumi.jpg',
            is_active: true
          }
        },
        Swimsuit: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Swimsuit unique identifier'
            },
            character_id: {
              type: 'integer',
              description: 'Related character ID'
            },
            unique_key: {
              type: 'string',
              description: 'Swimsuit unique key'
            },
            name_jp: {
              type: 'string',
              description: 'Swimsuit name in Japanese'
            },
            name_en: {
              type: 'string',
              description: 'Swimsuit name in English'
            },
            name_cn: {
              type: 'string',
              description: 'Swimsuit name in Chinese'
            },
            name_tw: {
              type: 'string',
              description: 'Swimsuit name in Traditional Chinese'
            },
            name_kr: {
              type: 'string',
              description: 'Swimsuit name in Korean'
            },
            description_en: {
              type: 'string',
              description: 'Swimsuit description in English'
            },
            rarity: {
              type: 'string',
              enum: ['N', 'R', 'SR', 'SSR', 'SSR+'],
              description: 'Swimsuit rarity'
            },
            suit_type: {
              type: 'string',
              enum: ['POW', 'TEC', 'STM', 'APL', 'N/A'],
              description: 'Swimsuit type'
            },
            total_stats_awakened: {
              type: 'integer',
              description: 'Total stats when awakened'
            },
            has_malfunction: {
              type: 'boolean',
              description: 'Whether swimsuit has malfunction'
            },
            is_limited: {
              type: 'boolean',
              description: 'Whether swimsuit is limited'
            },
            release_date_gl: {
              type: 'string',
              format: 'date',
              description: 'Global release date'
            }
          },
          required: ['id', 'character_id', 'unique_key', 'name_jp', 'name_en', 'rarity', 'suit_type', 'total_stats_awakened', 'has_malfunction', 'is_limited'],
          example: {
            id: 101,
            character_id: 1,
            unique_key: 'kasumi_ssr_princess_heart',
            name_jp: 'プリンセス・オブ・ハート',
            name_en: 'Princess of Heart',
            name_cn: '心之公主',
            name_tw: '心之公主',
            name_kr: '하트의 공주',
            description_en: 'A beautiful swimsuit that makes Kasumi look like a true princess.',
            rarity: 'SSR',
            suit_type: 'POW',
            total_stats_awakened: 15420,
            has_malfunction: true,
            is_limited: false,
            release_date_gl: '2024-02-14'
          }
        },
        Skill: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Skill unique identifier'
            },
            unique_key: {
              type: 'string',
              description: 'Skill unique key'
            },
            name_jp: {
              type: 'string',
              description: 'Skill name in Japanese'
            },
            name_en: {
              type: 'string',
              description: 'Skill name in English'
            },
            name_cn: {
              type: 'string',
              description: 'Skill name in Chinese'
            },
            name_tw: {
              type: 'string',
              description: 'Skill name in Traditional Chinese'
            },
            name_kr: {
              type: 'string',
              description: 'Skill name in Korean'
            },
            description_en: {
              type: 'string',
              description: 'Skill description in English'
            },
            skill_category: {
              type: 'string',
              enum: ['ACTIVE', 'PASSIVE', 'POTENTIAL'],
              description: 'Skill category'
            },
            effect_type: {
              type: 'string',
              description: 'Skill effect type'
            }
          },
          required: ['id', 'unique_key', 'name_jp', 'name_en', 'skill_category']
        },
        Item: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Item unique identifier'
            },
            unique_key: {
              type: 'string',
              description: 'Item unique key'
            },
            name_jp: {
              type: 'string',
              description: 'Item name in Japanese'
            },
            name_en: {
              type: 'string',
              description: 'Item name in English'
            },
            name_cn: {
              type: 'string',
              description: 'Item name in Chinese'
            },
            name_tw: {
              type: 'string',
              description: 'Item name in Traditional Chinese'
            },
            name_kr: {
              type: 'string',
              description: 'Item name in Korean'
            },
            description_en: {
              type: 'string',
              description: 'Item description in English'
            },
            source_description_en: {
              type: 'string',
              description: 'Item source description in English'
            },
            item_category: {
              type: 'string',
              enum: ['CURRENCY', 'UPGRADE_MATERIAL', 'CONSUMABLE', 'GIFT', 'ACCESSORY', 'FURNITURE', 'SPECIAL'],
              description: 'Item category'
            },
            rarity: {
              type: 'string',
              enum: ['N', 'R', 'SR', 'SSR'],
              description: 'Item rarity'
            },
            icon_url: {
              type: 'string',
              format: 'uri',
              description: 'Item icon URL'
            }
          },
          required: ['id', 'unique_key', 'name_jp', 'name_en', 'item_category', 'rarity']
        },
        Event: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Event unique identifier'
            },
            unique_key: {
              type: 'string',
              description: 'Event unique key'
            },
            name_jp: {
              type: 'string',
              description: 'Event name in Japanese'
            },
            name_en: {
              type: 'string',
              description: 'Event name in English'
            },
            name_cn: {
              type: 'string',
              description: 'Event name in Chinese'
            },
            name_tw: {
              type: 'string',
              description: 'Event name in Traditional Chinese'
            },
            name_kr: {
              type: 'string',
              description: 'Event name in Korean'
            },
            type: {
              type: 'string',
              enum: ['FESTIVAL_RANKING', 'FESTIVAL_CUMULATIVE', 'TOWER', 'ROCK_CLIMBING', 'BUTT_BATTLE', 'LOGIN_BONUS', 'STORY'],
              description: 'Event type'
            },
            start_date: {
              type: 'string',
              format: 'date-time',
              description: 'Event start date'
            },
            end_date: {
              type: 'string',
              format: 'date-time',
              description: 'Event end date'
            },
            is_active: {
              type: 'boolean',
              description: 'Whether event is currently active'
            }
          },
          required: ['id', 'unique_key', 'name_jp', 'name_en', 'type', 'start_date', 'end_date']
        },
        Bromide: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Bromide unique identifier'
            },
            unique_key: {
              type: 'string',
              description: 'Bromide unique key'
            },
            name_jp: {
              type: 'string',
              description: 'Bromide name in Japanese'
            },
            name_en: {
              type: 'string',
              description: 'Bromide name in English'
            },
            type: {
              type: 'string',
              enum: ['DECO', 'OWNER'],
              description: 'Bromide type'
            },
            rarity: {
              type: 'string',
              enum: ['R', 'SR', 'SSR'],
              description: 'Bromide rarity'
            },
            image_url: {
              type: 'string',
              format: 'uri',
              description: 'Bromide image URL'
            }
          },
          required: ['id', 'unique_key', 'name_jp', 'name_en', 'type', 'rarity']
        },
        Episode: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Episode unique identifier'
            },
            unique_key: {
              type: 'string',
              description: 'Episode unique key'
            },
            name_jp: {
              type: 'string',
              description: 'Episode name in Japanese'
            },
            name_en: {
              type: 'string',
              description: 'Episode name in English'
            },
            episode_type: {
              type: 'string',
              enum: ['MAIN', 'CHARACTER', 'EVENT', 'SWIMSUIT', 'ITEM'],
              description: 'Episode type'
            },
            related_entity_type: {
              type: 'string',
              description: 'Type of related entity'
            },
            related_entity_id: {
              type: 'integer',
              description: 'ID of related entity'
            },
            summary_en: {
              type: 'string',
              description: 'Episode summary in English'
            }
          },
          required: ['id', 'unique_key', 'name_jp', 'name_en', 'episode_type']
        },
        Gacha: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Gacha unique identifier'
            },
            unique_key: {
              type: 'string',
              description: 'Gacha unique key'
            },
            name_jp: {
              type: 'string',
              description: 'Gacha name in Japanese'
            },
            name_en: {
              type: 'string',
              description: 'Gacha name in English'
            },
            description_en: {
              type: 'string',
              description: 'Gacha description in English'
            },
            gacha_subtype: {
              type: 'string',
              enum: ['TRENDY', 'NOSTALGIC', 'BIRTHDAY', 'ANNIVERSARY', 'PAID', 'FREE', 'ETC'],
              description: 'Gacha subtype'
            },
            start_date: {
              type: 'string',
              format: 'date-time',
              description: 'Gacha start date'
            },
            end_date: {
              type: 'string',
              format: 'date-time',
              description: 'Gacha end date'
            },
            is_active: {
              type: 'boolean',
              description: 'Whether gacha is currently active'
            },
            banner_image_url: {
              type: 'string',
              format: 'uri',
              description: 'Gacha banner image URL'
            }
          },
          required: ['id', 'unique_key', 'name_jp', 'name_en', 'gacha_subtype', 'start_date', 'end_date'],
          example: {
            id: 201,
            unique_key: 'birthday_2024_kasumi',
            name_jp: 'かすみ誕生日ガチャ2024',
            name_en: 'Kasumi Birthday Gacha 2024',
            name_cn: '霞生日扭蛋2024',
            name_tw: '霞生日轉蛋2024',
            name_kr: '카스미 생일 가챠 2024',
            description_en: 'Special birthday gacha featuring exclusive Kasumi swimsuits and accessories.',
            gacha_subtype: 'BIRTHDAY',
            start_date: '2024-02-17T00:00:00Z',
            end_date: '2024-02-24T23:59:59Z',
            is_active: false,
            banner_image_url: 'https://example.com/gachas/kasumi_birthday_2024_banner.jpg'
          }
        },
        Document: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Document unique identifier'
            },
            unique_key: {
              type: 'string',
              description: 'Document unique key'
            },
            title_en: {
              type: 'string',
              description: 'Document title in English'
            },
            summary_en: {
              type: 'string',
              description: 'Document summary in English'
            },
            content_json_en: {
              type: 'object',
              description: 'Document content in JSON format'
            },
            screenshots: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri'
              },
              description: 'Array of screenshot URLs'
            },
            category: {
              type: 'string',
              description: 'Document category'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Document tags'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Document creation time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time',
              description: 'Document last update time'
            }
          },
          required: ['id', 'unique_key', 'title_en', 'created_at', 'updated_at']
        },
        UpdateLog: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Update log unique identifier'
            },
            unique_key: {
              type: 'string',
              description: 'Update log unique key'
            },
            title_en: {
              type: 'string',
              description: 'Update log title in English'
            },
            version: {
              type: 'string',
              description: 'Version number'
            },
            release_date: {
              type: 'string',
              format: 'date',
              description: 'Release date'
            },
            summary_en: {
              type: 'string',
              description: 'Update summary in English'
            },
            content_json_en: {
              type: 'object',
              description: 'Update content in JSON format'
            },

          },
          required: ['id', 'unique_key', 'title_en', 'version', 'release_date']
        },
        ShopListing: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Shop listing unique identifier'
            },
            unique_key: {
              type: 'string',
              description: 'Shop listing unique key'
            },
            name_jp: {
              type: 'string',
              description: 'Shop listing name in Japanese'
            },
            name_en: {
              type: 'string',
              description: 'Shop listing name in English'
            },
            description_en: {
              type: 'string',
              description: 'Shop listing description in English'
            },
            price: {
              type: 'number',
              description: 'Item price'
            },
            currency: {
              type: 'string',
              description: 'Price currency'
            },
            discount_percentage: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              description: 'Discount percentage'
            },
            is_limited_time: {
              type: 'boolean',
              description: 'Whether item is limited time'
            },
            start_date: {
              type: 'string',
              format: 'date-time',
              description: 'Sale start date'
            },
            end_date: {
              type: 'string',
              format: 'date-time',
              description: 'Sale end date'
            }
          },
          required: ['id', 'unique_key', 'name_jp', 'name_en', 'price', 'currency', 'is_limited_time']
        },
        FileUpload: {
          type: 'object',
          properties: {
            filename: {
              type: 'string',
              description: 'Generated filename'
            },
            originalName: {
              type: 'string',
              description: 'Original filename'
            },
            size: {
              type: 'integer',
              description: 'File size in bytes'
            },
            url: {
              type: 'string',
              format: 'uri',
              description: 'File URL'
            },
            mimeType: {
              type: 'string',
              description: 'File MIME type'
            }
          },
          required: ['filename', 'originalName', 'size', 'url', 'mimeType']
        },
        BatchCreateRequest: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object'
              },
              description: 'Array of items to create'
            }
          },
          required: ['items']
        },
        BatchCreateResponse: {
          type: 'object',
          properties: {
            created: {
              type: 'integer',
              description: 'Number of items created'
            },
            failed: {
              type: 'integer',
              description: 'Number of items failed'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  index: {
                    type: 'integer',
                    description: 'Index of failed item'
                  },
                  error: {
                    type: 'string',
                    description: 'Error message'
                  }
                }
              },
              description: 'Array of errors for failed items'
            }
          },
          required: ['created', 'failed']
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              enum: ['healthy', 'unhealthy'],
              description: 'Overall system health status'
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: 'Health check timestamp'
            },
            uptime: {
              type: 'number',
              description: 'Server uptime in seconds'
            },
            responseTime: {
              type: 'string',
              description: 'Health check response time'
            },
            version: {
              type: 'string',
              description: 'API version'
            },
            environment: {
              type: 'string',
              description: 'Environment (development/production)'
            },
            database: {
              type: 'object',
              properties: {
                status: {
                  type: 'string',
                  enum: ['connected', 'disconnected'],
                  description: 'Database connection status'
                }
              }
            },
            memory: {
              type: 'object',
              properties: {
                used: {
                  type: 'number',
                  description: 'Used memory in MB'
                },
                total: {
                  type: 'number',
                  description: 'Total memory in MB'
                },
                external: {
                  type: 'number',
                  description: 'External memory in MB'
                }
              }
            }
          },
          required: ['status', 'timestamp', 'uptime', 'responseTime', 'version', 'environment', 'database', 'memory']
        }
      },
      parameters: {
        PageParam: {
          name: 'page',
          in: 'query',
          description: 'Page number for pagination',
          required: false,
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
          required: false,
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
          required: false,
          schema: {
            type: 'string'
          }
        },
        SortOrderParam: {
          name: 'sortOrder',
          in: 'query',
          description: 'Sort order',
          required: false,
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'asc'
          }
        },
        SearchParam: {
          name: 'q',
          in: 'query',
          description: 'Search query string',
          required: false,
          schema: {
            type: 'string'
          }
        },
        IdParam: {
          name: 'id',
          in: 'path',
          description: 'Resource ID',
          required: true,
          schema: {
            type: 'integer',
            minimum: 1
          }
        },
        UniqueKeyParam: {
          name: 'unique_key',
          in: 'path',
          description: 'Resource unique key',
          required: true,
          schema: {
            type: 'string'
          }
        },
        RarityParam: {
          name: 'rarity',
          in: 'query',
          description: 'Filter by rarity',
          required: false,
          schema: {
            type: 'string',
            enum: ['N', 'R', 'SR', 'SSR', 'SSR+']
          }
        },
        CharacterIdParam: {
          name: 'character_id',
          in: 'query',
          description: 'Filter by character ID',
          required: false,
          schema: {
            type: 'integer'
          }
        },
        CategoryParam: {
          name: 'category',
          in: 'query',
          description: 'Filter by category',
          required: false,
          schema: {
            type: 'string'
          }
        },
        TypeParam: {
          name: 'type',
          in: 'query',
          description: 'Filter by type',
          required: false,
          schema: {
            type: 'string'
          }
        },
        IsActiveParam: {
          name: 'is_active',
          in: 'query',
          description: 'Filter by active status',
          required: false,
          schema: {
            type: 'boolean'
          }
        },
        StartDateParam: {
          name: 'start_date',
          in: 'query',
          description: 'Filter by start date (YYYY-MM-DD)',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          }
        },
        EndDateParam: {
          name: 'end_date',
          in: 'query',
          description: 'Filter by end date (YYYY-MM-DD)',
          required: false,
          schema: {
            type: 'string',
            format: 'date'
          }
        }
      },
      responses: {
        Success: {
          description: 'Successful response',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiSuccess' }
            }
          }
        },
        PaginatedSuccess: {
          description: 'Successful paginated response',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PaginatedResponse' }
            }
          }
        },
        Error: {
          description: 'Error response',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' }
            }
          }
        },
        ValidationError: {
          description: 'Validation error response',
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/ApiError' },
                  {
                    type: 'object',
                    properties: {
                      details: {
                        type: 'object',
                        properties: {
                          validationErrors: {
                            type: 'array',
                            items: {
                              type: 'object',
                              properties: {
                                field: { type: 'string' },
                                message: { type: 'string' },
                                value: {}
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        NotFound: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ApiError' }
            }
          }
        }
      }
    },
    tags: [
      {
        name: 'Health',
        description: 'Health check and system status endpoints'
      },
      {
        name: 'Characters',
        description: 'Character management operations'
      },
      {
        name: 'Swimsuits',
        description: 'Swimsuit management operations'
      },
      {
        name: 'Skills',
        description: 'Skill management operations'
      },
      {
        name: 'Items',
        description: 'Item management operations'
      },
      {
        name: 'Events',
        description: 'Event management operations'
      },
      {
        name: 'Episodes',
        description: 'Episode management operations'
      },
      {
        name: 'Bromides',
        description: 'Bromide management operations'
      },
      {
        name: 'Gachas',
        description: 'Gacha management operations'
      },
      {
        name: 'Shop Listings',
        description: 'Shop listing management operations'
      },
      {
        name: 'Documents',
        description: 'Document management operations'
      },
      {
        name: 'Update Logs',
        description: 'Update log management operations'
      },
      {
        name: 'Upload',
        description: 'File upload operations'
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/docs/swagger/*.yml'
  ]
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };
export default options; 