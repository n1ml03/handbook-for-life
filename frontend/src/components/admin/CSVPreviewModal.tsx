import React from 'react';
import { X, ArrowUpDown, Eye, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/services/utils';

interface CSVValidationError {
  row: number;
  column: string;
  message: string;
  severity: 'error' | 'warning';
}

interface CSVPreviewData {
  headers: string[];
  rows: string[][];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: CSVValidationError[];
}

interface ColumnMapping {
  csvColumn: string;
  dbField: string;
  isRequired: boolean;
  dataType: 'string' | 'number' | 'boolean' | 'date' | 'array';
}

export interface CSVPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  csvPreview: CSVPreviewData | null;
  columnMappings: ColumnMapping[];
  onColumnMappingsChange: (mappings: ColumnMapping[]) => void;
  onImport: () => void;
}

export const CSVPreviewModal: React.FC<CSVPreviewModalProps> = ({
  isOpen,
  onClose,
  csvPreview,
  columnMappings,
  onColumnMappingsChange,
  onImport
}) => {
  if (!isOpen || !csvPreview) return null;

  const updateColumnMapping = (index: number, csvColumn: string) => {
    const newMappings = [...columnMappings];
    newMappings[index].csvColumn = csvColumn;
    onColumnMappingsChange(newMappings);
  };

  const criticalErrors = csvPreview.errors.filter(e => e.severity === 'error').length;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-xl font-semibold">CSV Data Preview</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {csvPreview.totalRows} rows, {csvPreview.headers.length} columns
              {csvPreview.invalidRows > 0 && (
                <span className="text-yellow-600 ml-2">
                  ({csvPreview.invalidRows} rows with issues)
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-muted/20 transition-colors duration-200 focus:ring-2 focus:ring-accent-cyan/20 focus:outline-hidden"
            aria-label="Close preview modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Column Mapping Section */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <ArrowUpDown className="w-5 h-5 text-accent-cyan" />
              Column Mapping
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {columnMappings.map((mapping, index) => (
                <div key={mapping.dbField} className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    {mapping.dbField}
                    {mapping.isRequired && <span className="text-red-500">*</span>}
                    <Badge variant="outline" className="text-xs">
                      {mapping.dataType}
                    </Badge>
                  </label>
                  <Select
                    value={mapping.csvColumn}
                    onValueChange={(value) => updateColumnMapping(index, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select CSV column..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- None --</SelectItem>
                      {csvPreview.headers.map(header => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          {/* Data Preview Table */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              <Eye className="w-5 h-5 text-accent-purple" />
              Data Preview (First 10 rows)
            </h4>
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">#</th>
                      {csvPreview.headers.map(header => (
                        <th key={header} className="px-3 py-2 text-left font-medium">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.rows.slice(0, 10).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t border-border">
                        <td className="px-3 py-2 text-muted-foreground font-medium">{rowIndex + 1}</td>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex} className="px-3 py-2 max-w-xs truncate">
                            {cell || <span className="text-muted-foreground italic">empty</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            {csvPreview.totalRows > 10 && (
              <p className="text-sm text-muted-foreground text-center">
                Showing first 10 rows of {csvPreview.totalRows} total rows
              </p>
            )}
          </div>

          {/* Validation Errors */}
          {csvPreview.errors.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-semibold flex items-center gap-2 text-yellow-600">
                <X className="w-5 h-5" />
                Validation Issues ({csvPreview.errors.length})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {csvPreview.errors.slice(0, 20).map((error, index) => (
                  <div
                    key={index}
                    className={cn(
                      "p-3 rounded-lg border text-sm",
                      error.severity === 'error'
                        ? "border-red-500/20 bg-red-500/5 text-red-700"
                        : "border-yellow-500/20 bg-yellow-500/5 text-yellow-700"
                    )}
                  >
                    <span className="font-medium">Row {error.row}:</span> {error.message}
                  </div>
                ))}
                {csvPreview.errors.length > 20 && (
                  <p className="text-sm text-muted-foreground text-center">
                    ... and {csvPreview.errors.length - 20} more issues
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-6 border-t border-border bg-muted/20">
          <div className="text-sm text-muted-foreground">
            {csvPreview.validRows} valid rows, {csvPreview.invalidRows} rows with issues
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={onImport}
              disabled={criticalErrors > 0}
              className="bg-gradient-to-r from-accent-cyan to-accent-purple"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export type { CSVPreviewData, CSVValidationError, ColumnMapping }; 