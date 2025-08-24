import { PDFDocument } from 'pdf-lib';
import logger from '../config/logger';

export interface PDFCompressionOptions {
  quality?: 'low' | 'medium' | 'high';
  removeMetadata?: boolean;
  optimizeImages?: boolean;
  compressStreams?: boolean;
}

export interface PDFCompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  compressedBuffer: Buffer;
  savings: number; // in bytes
  savingsPercentage: number;
}

export class PDFCompressionService {
  
  /**
   * Compress a PDF file to reduce its size
   */
  async compressPDF(
    pdfBuffer: Buffer, 
    options: PDFCompressionOptions = {}
  ): Promise<PDFCompressionResult> {
    try {
      const originalSize = pdfBuffer.length;
      logger.info(`Starting PDF compression. Original size: ${(originalSize / (1024 * 1024)).toFixed(2)}MB`);
      
      // Load the PDF document
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      
      // Apply compression based on quality level
      const quality = options.quality || 'medium';
      
      // Remove metadata if requested
      if (options.removeMetadata !== false) {
        this.removeMetadata(pdfDoc);
      }
      
      // Set compression options based on quality level
      let saveOptions: any = {};
      
      switch (quality) {
        case 'high':
          saveOptions = {
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 500,
          };
          break;
        case 'medium':
          saveOptions = {
            useObjectStreams: true,
            addDefaultPage: false,
            objectsPerTick: 200,
          };
          break;
        case 'low':
          saveOptions = {
            useObjectStreams: false,
            addDefaultPage: false,
            objectsPerTick: 100,
          };
          break;
      }
      
      // Save the compressed PDF
      const compressedBytes = await pdfDoc.save(saveOptions);
      const compressedBuffer = Buffer.from(compressedBytes);
      const compressedSize = compressedBuffer.length;
      
      // Calculate compression statistics
      const savings = originalSize - compressedSize;
      const compressionRatio = originalSize > 0 ? compressedSize / originalSize : 1;
      const savingsPercentage = originalSize > 0 ? (savings / originalSize) * 100 : 0;
      
      logger.info(`PDF compression completed:`, {
        originalSize: `${(originalSize / (1024 * 1024)).toFixed(2)}MB`,
        compressedSize: `${(compressedSize / (1024 * 1024)).toFixed(2)}MB`,
        savings: `${(savings / (1024 * 1024)).toFixed(2)}MB`,
        savingsPercentage: `${savingsPercentage.toFixed(1)}%`,
        compressionRatio: compressionRatio.toFixed(2)
      });
      
      return {
        originalSize,
        compressedSize,
        compressionRatio,
        compressedBuffer,
        savings,
        savingsPercentage
      };
      
    } catch (error) {
      logger.error('PDF compression failed:', error);
      
      // Return original buffer if compression fails
      return {
        originalSize: pdfBuffer.length,
        compressedSize: pdfBuffer.length,
        compressionRatio: 1,
        compressedBuffer: pdfBuffer,
        savings: 0,
        savingsPercentage: 0
      };
    }
  }
  
  /**
   * Remove metadata from PDF to reduce size
   */
  private removeMetadata(pdfDoc: PDFDocument): void {
    try {
      // Remove document info dictionary
      const infoDict = pdfDoc.context.trailerInfo.Info;
      if (infoDict) {
        const infoRef = pdfDoc.context.trailerInfo.Info;
        if (infoRef) {
          // Clear metadata fields
          const infoObject = pdfDoc.context.lookup(infoRef);
          if (infoObject) {
            // Remove common metadata fields
            const metadataFields = [
              'Title', 'Author', 'Subject', 'Keywords', 
              'Creator', 'Producer', 'CreationDate', 'ModDate'
            ];
            
            metadataFields.forEach(field => {
              try {
                infoObject.delete(field);
              } catch (e) {
                // Ignore individual field deletion errors
              }
            });
          }
        }
      }
      
      logger.debug('PDF metadata removed successfully');
    } catch (error) {
      logger.warn('Failed to remove PDF metadata:', error);
    }
  }
  
  /**
   * Analyze PDF to suggest compression options
   */
  async analyzePDF(pdfBuffer: Buffer): Promise<{
    pageCount: number;
    estimatedTextContent: number;
    estimatedImageContent: number;
    suggestedQuality: 'low' | 'medium' | 'high';
    canCompress: boolean;
    reasons: string[];
  }> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      // Basic analysis - in a real implementation, you'd analyze content more thoroughly
      let suggestedQuality: 'low' | 'medium' | 'high' = 'medium';
      const reasons: string[] = [];
      let canCompress = true;
      
      // Simple heuristics based on file size and page count
      const fileSizeMB = pdfBuffer.length / (1024 * 1024);
      const averagePageSize = fileSizeMB / pageCount;
      
      if (fileSizeMB < 1) {
        suggestedQuality = 'high';
        reasons.push('Small file - use high quality compression');
      } else if (fileSizeMB > 10) {
        suggestedQuality = 'low';
        reasons.push('Large file - use aggressive compression');
      } else {
        suggestedQuality = 'medium';
        reasons.push('Medium-sized file - use balanced compression');
      }
      
      if (averagePageSize > 2) {
        reasons.push('Large average page size detected - likely contains images');
      }
      
      if (pageCount > 100) {
        reasons.push('Many pages - compression will be beneficial');
      }
      
      return {
        pageCount,
        estimatedTextContent: 50, // Placeholder - would need more sophisticated analysis
        estimatedImageContent: 50, // Placeholder - would need more sophisticated analysis
        suggestedQuality,
        canCompress,
        reasons
      };
      
    } catch (error) {
      logger.error('PDF analysis failed:', error);
      return {
        pageCount: 0,
        estimatedTextContent: 0,
        estimatedImageContent: 0,
        suggestedQuality: 'medium',
        canCompress: false,
        reasons: ['Unable to analyze PDF structure']
      };
    }
  }
  
  /**
   * Get compression recommendations based on file size and content
   */
  getCompressionRecommendations(fileSizeMB: number, pageCount: number): {
    recommended: boolean;
    quality: 'low' | 'medium' | 'high';
    expectedSavings: string;
    reasons: string[];
  } {
    const reasons: string[] = [];
    let recommended = false;
    let quality: 'low' | 'medium' | 'high' = 'medium';
    let expectedSavings = '5-15%';
    
    if (fileSizeMB > 5) {
      recommended = true;
      quality = 'low';
      expectedSavings = '20-40%';
      reasons.push('Large file size - significant compression possible');
    } else if (fileSizeMB > 2) {
      recommended = true;
      quality = 'medium';
      expectedSavings = '10-25%';
      reasons.push('Medium file size - moderate compression beneficial');
    } else if (fileSizeMB > 0.5) {
      recommended = true;
      quality = 'high';
      expectedSavings = '5-15%';
      reasons.push('Small file - gentle compression recommended');
    } else {
      recommended = false;
      reasons.push('File already very small - compression may not be beneficial');
    }
    
    if (pageCount > 50) {
      reasons.push('Many pages - compression will reduce storage significantly');
    }
    
    return {
      recommended,
      quality,
      expectedSavings,
      reasons
    };
  }
}