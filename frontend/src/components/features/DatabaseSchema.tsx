import { motion } from 'framer-motion';
import { Database, Key, Link } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TableInfo {
  name: string;
  color: string;
  fields: string[];
  relationships: string[];
}

const tables: TableInfo[] = [
  {
    name: 'characters',
    color: 'accent-cyan',
    fields: ['id (PK)', 'name', 'name_jp', 'name_en', 'name_zh'],
    relationships: ['swimsuits.character_id']
  },
  {
    name: 'skills',
    color: 'accent-gold',
    fields: ['id (PK)', 'name', 'type', 'description', 'icon'],
    relationships: ['swimsuit_skills.skill_id', 'accessories.skill_id']
  },
  {
    name: 'swimsuits',
    color: 'accent-pink',
    fields: ['id (PK)', 'name', 'character_id (FK)', 'rarity', 'pow', 'tec', 'stm', 'apl', 'release_date'],
    relationships: ['girls.swimsuit_id', 'swimsuit_skills.swimsuit_id']
  },
  {
    name: 'girls',
    color: 'accent-purple',
    fields: ['id (PK)', 'name', 'type', 'level', 'stats...', 'swimsuit_id (FK)'],
    relationships: ['venus_boards.girl_id', 'girl_accessories.girl_id']
  },
  {
    name: 'accessories',
    color: 'accent-green',
    fields: ['id (PK)', 'name', 'type', 'skill_id (FK)', 'stats...'],
    relationships: ['girl_accessories.accessory_id']
  },
  {
    name: 'venus_boards',
    color: 'accent-orange',
    fields: ['id (PK)', 'girl_id (FK)', 'pow', 'tec', 'stm', 'apl'],
    relationships: []
  }
];

export default function DatabaseSchema() {
  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5 text-accent-cyan" />
          <span>Database Schema</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tables.map((table, index) => (
            <motion.div
              key={table.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-${table.color}/10 border border-${table.color}/30 rounded-lg p-4`}
            >
              <div className="flex items-center space-x-2 mb-3">
                <Database className={`w-4 h-4 text-${table.color}`} />
                <h3 className={`font-medium text-${table.color}`}>{table.name}</h3>
              </div>
              
              <div className="space-y-1 mb-3">
                {table.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="flex items-center space-x-1 text-xs">
                    {field.includes('(PK)') ? (
                      <Key className="w-3 h-3 text-yellow-400" />
                    ) : field.includes('(FK)') ? (
                      <Link className="w-3 h-3 text-blue-400" />
                    ) : (
                      <div className="w-3 h-3" />
                    )}
                    <span className="text-gray-300">{field}</span>
                  </div>
                ))}
              </div>
              
              {table.relationships.length > 0 && (
                <div className="border-t border-gray-600 pt-2">
                  <div className="text-xs text-gray-400 mb-1">Relationships:</div>
                  {table.relationships.map((rel, relIndex) => (
                    <div key={relIndex} className="text-xs text-gray-500">
                      → {rel}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium text-foreground mb-2">Key Features:</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Complete referential integrity with foreign key constraints</li>
            <li>• Optimized indexes for fast queries</li>
            <li>• Support for many-to-many relationships (swimsuit_skills, girl_accessories)</li>
            <li>• Automatic timestamp tracking for all records</li>
            <li>• Persistent storage in browser using SQLite WASM</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
} 