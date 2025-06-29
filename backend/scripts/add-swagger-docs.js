#!/usr/bin/env node

/**
 * Script to add basic Swagger JSDoc comments to route files
 * This script adds minimal documentation for endpoints that don't have it yet
 */

import fs from 'fs';
import path from 'path';

const routesDir = path.join(process.cwd(), 'src', 'routes');

// Route configuration mapping
const routeConfigs = {
  'swimsuits.ts': {
    tag: 'Swimsuits',
    entity: 'Swimsuit',
    description: 'swimsuit',
    plural: 'swimsuits'
  },
  'skills.ts': {
    tag: 'Skills', 
    entity: 'Skill',
    description: 'skill',
    plural: 'skills'
  },
  'items.ts': {
    tag: 'Items',
    entity: 'Item', 
    description: 'item',
    plural: 'items'
  },
  'events.ts': {
    tag: 'Events',
    entity: 'Event',
    description: 'event', 
    plural: 'events'
  },
  'episodes.ts': {
    tag: 'Episodes',
    entity: 'Episode',
    description: 'episode',
    plural: 'episodes'
  },
  'bromides.ts': {
    tag: 'Bromides',
    entity: 'Bromide',
    description: 'bromide',
    plural: 'bromides'
  },
  'gachas.ts': {
    tag: 'Gachas',
    entity: 'Gacha',
    description: 'gacha',
    plural: 'gachas'
  },
  'shop-listings.ts': {
    tag: 'Shop Listings',
    entity: 'ShopListing',
    description: 'shop listing',
    plural: 'shop-listings'
  },
  'documents.ts': {
    tag: 'Documents',
    entity: 'Document',
    description: 'document',
    plural: 'documents'
  },
  'update-logs.ts': {
    tag: 'Update Logs',
    entity: 'UpdateLog',
    description: 'update log',
    plural: 'update-logs'
  },
  'upload.ts': {
    tag: 'Upload',
    entity: 'Upload',
    description: 'upload',
    plural: 'upload'
  }
};

// Basic JSDoc templates
const createGetAllDocs = (config, path) => `/**
 * @swagger
 * /api/${config.plural}:
 *   get:
 *     tags: [${config.tag}]
 *     summary: Get all ${config.plural} with pagination
 *     description: Retrieve a paginated list of all ${config.plural}
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PaginatedSuccess'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */`;

const createGetByIdDocs = (config, path) => `/**
 * @swagger
 * /api/${config.plural}/{id}:
 *   get:
 *     tags: [${config.tag}]
 *     summary: Get ${config.description} by ID
 *     description: Retrieve a specific ${config.description} by their ID
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */`;

const createSearchDocs = (config, path) => `/**
 * @swagger
 * /api/${config.plural}/search:
 *   get:
 *     tags: [${config.tag}]
 *     summary: Search ${config.plural}
 *     description: Search ${config.plural} by name or other criteria
 *     parameters:
 *       - $ref: '#/components/parameters/SearchParam'
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SortByParam'
 *       - $ref: '#/components/parameters/SortOrderParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PaginatedSuccess'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */`;

const createPostDocs = (config, path) => `/**
 * @swagger
 * /api/${config.plural}:
 *   post:
 *     tags: [${config.tag}]
 *     summary: Create new ${config.description}
 *     description: Create a new ${config.description} with provided details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               unique_key:
 *                 type: string
 *                 description: Unique identifier key
 *     responses:
 *       201:
 *         description: ${config.description} created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */`;

const createPutDocs = (config, path) => `/**
 * @swagger
 * /api/${config.plural}/{id}:
 *   put:
 *     tags: [${config.tag}]
 *     summary: Update ${config.description}
 *     description: Update an existing ${config.description}
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */`;

const createDeleteDocs = (config, path) => `/**
 * @swagger
 * /api/${config.plural}/{id}:
 *   delete:
 *     tags: [${config.tag}]
 *     summary: Delete ${config.description}
 *     description: Delete an existing ${config.description}
 *     parameters:
 *       - $ref: '#/components/parameters/IdParam'
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */`;

// Function to detect route patterns and add documentation
function addDocsToRouteFile(filePath, config) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if file already has swagger comments
  if (content.includes('@swagger')) {
    console.log(`⏭️  Skipping ${path.basename(filePath)} - already has Swagger docs`);
    return;
  }

  console.log(`📝 Adding docs to ${path.basename(filePath)}`);

  // Patterns to match different route types
  const patterns = [
    {
      regex: /\/\/ GET .*\/ - Get all .* with pagination\nrouter\.get\('\/',/g,
      template: createGetAllDocs,
      replacement: (match, config) => match.replace(/\/\/ GET.*\n/, createGetAllDocs(config) + '\n')
    },
    {
      regex: /\/\/ GET .*\/:id - Get .* by ID\nrouter\.get\('\/:id',/g,
      template: createGetByIdDocs,
      replacement: (match, config) => match.replace(/\/\/ GET.*\n/, createGetByIdDocs(config) + '\n')
    },
    {
      regex: /\/\/ GET .*\/search - Search .*\nrouter\.get\('\/search',/g,
      template: createSearchDocs,
      replacement: (match, config) => match.replace(/\/\/ GET.*\n/, createSearchDocs(config) + '\n')
    },
    {
      regex: /\/\/ POST .*\/ - Create .*\nrouter\.post\('\/',/g,
      template: createPostDocs,
      replacement: (match, config) => match.replace(/\/\/ POST.*\n/, createPostDocs(config) + '\n')
    },
    {
      regex: /\/\/ PUT .*\/:id - Update .*\nrouter\.put\('\/:id',/g,
      template: createPutDocs,
      replacement: (match, config) => match.replace(/\/\/ PUT.*\n/, createPutDocs(config) + '\n')
    },
    {
      regex: /\/\/ DELETE .*\/:id - Delete .*\nrouter\.delete\('\/:id',/g,
      template: createDeleteDocs,
      replacement: (match, config) => match.replace(/\/\/ DELETE.*\n/, createDeleteDocs(config) + '\n')
    }
  ];

  let modified = false;

  patterns.forEach(pattern => {
    if (pattern.regex.test(content)) {
      content = content.replace(pattern.regex, (match) => {
        modified = true;
        return pattern.replacement(match, config);
      });
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${path.basename(filePath)}`);
  } else {
    console.log(`ℹ️  No matching patterns found in ${path.basename(filePath)}`);
  }
}

// Main execution
function main() {
  console.log('🚀 Starting Swagger documentation generation...\n');

  if (!fs.existsSync(routesDir)) {
    console.error('❌ Routes directory not found:', routesDir);
    process.exit(1);
  }

  const routeFiles = fs.readdirSync(routesDir).filter(file => 
    file.endsWith('.ts') && file !== 'index.ts'
  );

  routeFiles.forEach(file => {
    const filePath = path.join(routesDir, file);
    const config = routeConfigs[file];

    if (!config) {
      console.log(`⚠️  No configuration found for ${file}, skipping...`);
      return;
    }

    try {
      addDocsToRouteFile(filePath, config);
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  });

  console.log('\n🎉 Swagger documentation generation completed!');
  console.log('📋 Next steps:');
  console.log('   1. Restart your server: bun run dev');
  console.log('   2. Check Swagger UI: http://localhost:3001/api-docs');
  console.log('   3. Review and customize the generated documentation');
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 