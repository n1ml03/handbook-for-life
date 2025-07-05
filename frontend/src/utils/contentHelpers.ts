/**
 * Content conversion and validation utilities for TipTap editor
 */

export interface TipTapDocument {
  type: 'doc';
  content: any[];
}

/**
 * Validates if an object is a valid TipTap document
 */
export function isValidTipTapDocument(content: any): content is TipTapDocument {
  return (
    typeof content === 'object' &&
    content !== null &&
    content.type === 'doc' &&
    Array.isArray(content.content)
  );
}

/**
 * Converts various content formats to TipTap JSON format
 */
export function convertToTipTapFormat(content: any): TipTapDocument {
  // If content is already a valid TipTap document, return it
  if (isValidTipTapDocument(content)) {
    return content;
  }

  // If content is null or undefined, return empty document
  if (!content) {
    return createEmptyTipTapDocument();
  }

  // If content is an object but not a valid TipTap document
  if (typeof content === 'object') {
    // Try to convert to string and parse
    const jsonString = JSON.stringify(content);
    return convertToTipTapFormat(jsonString);
  }

  // If content is a string
  if (typeof content === 'string') {
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      return createEmptyTipTapDocument();
    }

    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(trimmedContent);
      if (isValidTipTapDocument(parsed)) {
        return parsed;
      }
    } catch (parseError) {
      // Not valid JSON, continue with other formats
    }

    // Check if it's HTML content
    if (trimmedContent.includes('<') && trimmedContent.includes('>')) {
      return convertHtmlToTipTap(trimmedContent);
    }

    // Treat as plain text
    return convertPlainTextToTipTap(trimmedContent);
  }

  // Fallback for unknown types
  return createEmptyTipTapDocument();
}

/**
 * Creates an empty TipTap document
 */
export function createEmptyTipTapDocument(): TipTapDocument {
  return {
    type: 'doc',
    content: [
      {
        type: 'paragraph',
        content: []
      }
    ]
  };
}

/**
 * Converts plain text to TipTap format
 */
export function convertPlainTextToTipTap(text: string): TipTapDocument {
  if (!text || text.trim() === '') {
    return createEmptyTipTapDocument();
  }

  // Split by newlines and create paragraphs
  const paragraphs = text.split('\n').filter(line => line.trim() !== '');
  
  if (paragraphs.length === 0) {
    return createEmptyTipTapDocument();
  }

  return {
    type: 'doc',
    content: paragraphs.map(paragraph => ({
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: paragraph
        }
      ]
    }))
  };
}

/**
 * Converts HTML to TipTap format (simplified)
 */
export function convertHtmlToTipTap(html: string): TipTapDocument {
  // This is a simplified conversion - in a real implementation,
  // you might want to use a proper HTML to TipTap parser
  const textContent = html.replace(/<[^>]*>/g, '').trim();
  
  if (!textContent) {
    return createEmptyTipTapDocument();
  }

  return convertPlainTextToTipTap(textContent);
}

/**
 * Validates content length and format
 */
export function validateContentLength(content: any, maxLength: number = 50000): void {
  let contentLength = 0;

  if (typeof content === 'string') {
    contentLength = content.length;
  } else if (typeof content === 'object') {
    contentLength = JSON.stringify(content).length;
  }

  if (contentLength > maxLength) {
    throw new Error(`Content is too long (maximum ${maxLength.toLocaleString()} characters)`);
  }
}

/**
 * Extracts plain text from TipTap document for display purposes
 */
export function extractTextFromTipTap(document: TipTapDocument): string {
  if (!document || !document.content) {
    return '';
  }

  function extractFromNode(node: any): string {
    if (node.type === 'text') {
      return node.text || '';
    }

    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractFromNode).join('');
    }

    return '';
  }

  return document.content.map(extractFromNode).join('\n').trim();
}

/**
 * Sanitizes and validates document data for API submission
 */
export function sanitizeDocumentForApi(document: any): any {
  const sanitized = { ...document };

  // Ensure required fields exist
  if (!sanitized.title_en && sanitized.title) {
    sanitized.title_en = sanitized.title;
  }

  if (!sanitized.unique_key) {
    sanitized.unique_key = `doc-${Date.now()}`;
  }

  // Handle content conversion
  if (sanitized.content_json_en) {
    sanitized.content_json_en = convertToTipTapFormat(sanitized.content_json_en);
  } else if (sanitized.content) {
    sanitized.content_json_en = convertToTipTapFormat(sanitized.content);
  }

  // Validate content length
  if (sanitized.content_json_en) {
    validateContentLength(sanitized.content_json_en);
  }

  // Ensure arrays exist
  sanitized.tags = sanitized.tags || [];
  sanitized.screenshots = sanitized.screenshots || [];
  sanitized.screenshots_data = sanitized.screenshots_data || [];

  return sanitized;
} 