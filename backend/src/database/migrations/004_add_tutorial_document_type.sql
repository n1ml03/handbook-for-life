-- Migration: Add 'tutorial' to document_type ENUM
-- Created: 2024-01-XX
-- Purpose: Support tutorial document type with PDF file attachment capabilities

-- Add 'tutorial' to the document_type enum
ALTER TABLE documents 
MODIFY COLUMN document_type ENUM('checklist', 'guide', 'tutorial') NOT NULL DEFAULT 'guide' 
COMMENT 'Type of document for categorization and specialized handling';

-- Update index comment to reflect the new document type
DROP INDEX idx_document_type ON documents;
CREATE INDEX idx_document_type ON documents (document_type) 
COMMENT 'Index for filtering documents by type (checklist, guide, tutorial)';

-- Update composite index comment as well
DROP INDEX idx_document_type_updated ON documents;
CREATE INDEX idx_document_type_updated ON documents (document_type, updated_at DESC) 
COMMENT 'Composite index for type-based queries with sorting (includes tutorial)';

-- Add a comment documenting the tutorial type support
ALTER TABLE documents 
COMMENT 'Manages documents and guide articles. Supports checklist, guide, and tutorial types with PDF attachment support for tutorials';
