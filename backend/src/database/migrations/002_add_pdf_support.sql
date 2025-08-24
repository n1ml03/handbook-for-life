-- Migration: Add PDF file support to documents table
-- File: 002_add_pdf_support.sql
-- Author: System
-- Created: 2024-08-23

-- Add PDF storage fields to documents table
ALTER TABLE documents 
ADD COLUMN pdf_data LONGBLOB COMMENT 'Binary PDF file data',
ADD COLUMN pdf_filename VARCHAR(255) COMMENT 'Original PDF filename',
ADD COLUMN pdf_mime_type VARCHAR(100) DEFAULT 'application/pdf' COMMENT 'PDF MIME type',
ADD COLUMN pdf_size INT UNSIGNED COMMENT 'PDF file size in bytes',
ADD COLUMN has_pdf_file BOOLEAN DEFAULT FALSE COMMENT 'Flag indicating if document has PDF attachment';

-- Create index for faster queries on documents with PDF files
CREATE INDEX idx_documents_has_pdf ON documents(has_pdf_file);
CREATE INDEX idx_documents_pdf_filename ON documents(pdf_filename);

-- Update existing documents to set has_pdf_file flag
UPDATE documents SET has_pdf_file = FALSE WHERE has_pdf_file IS NULL;

-- Migration completed
-- This migration adds PDF file storage capabilities to the documents table
-- allowing documents to have attached PDF files stored directly in the database