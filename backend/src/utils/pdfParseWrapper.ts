/**
 * Wrapper for pdf-parse to avoid test code execution
 * 
 * The pdf-parse module has a known issue where it runs test code
 * when !module.parent (when loaded directly). This wrapper
 * ensures we only get the parsing functionality.
 */

// Import the actual parser directly from the lib directory
// This bypasses the test code in the main index.js
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

export default pdfParse;