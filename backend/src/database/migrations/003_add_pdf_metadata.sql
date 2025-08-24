-- Migration: Add PDF metadata support to documents table
-- Description: Adds pdf_metadata JSON column to store extracted PDF information

ALTER TABLE documents 
ADD COLUMN pdf_metadata JSON DEFAULT NULL COMMENT 'PDF metadata including page count, text content info, and extraction details';

-- Update existing PDF documents with empty metadata (will be populated on next upload)
UPDATE documents 
SET pdf_metadata = JSON_OBJECT(
    'pages', 0,
    'hasText', false,
    'textLength', 0,
    'version', 'unknown',
    'info', JSON_OBJECT(),
    'extractedAt', NOW(),
    'textPreview', ''
)
WHERE has_pdf_file = TRUE AND pdf_metadata IS NULL;