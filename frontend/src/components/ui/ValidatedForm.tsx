import React from 'react';
import { useForm, UseFormReturn, FieldValues, Path } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormGroup } from '@/components/ui/spacing';
import { AlertCircle, Save, X } from 'lucide-react';
import { cn } from '@/services/utils';

// =============================================================================
// VALIDATED FORM COMPONENTS
// =============================================================================

/**
 * Props for ValidatedForm component
 */
export interface ValidatedFormProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void | Promise<void>;
  onCancel?: () => void;
  children: React.ReactNode;
  submitLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
  className?: string;
}

/**
 * Enhanced form wrapper with validation support
 */
export function ValidatedForm<T extends FieldValues>({
  form,
  onSubmit,
  onCancel,
  children,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  isSubmitting = false,
  className
}: ValidatedFormProps<T>) {
  const { handleSubmit, formState: { errors, isValid, isDirty } } = form;

  // Get all error messages for display
  const errorMessages = Object.values(errors)
    .map(error => error?.message)
    .filter(Boolean) as string[];

  return (
    <form 
      onSubmit={handleSubmit(onSubmit)} 
      className={cn('space-y-6', className)}
      noValidate
    >
      {/* Global error display */}
      {errorMessages.length > 0 && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">
                Please fix the following errors:
              </p>
              <ul className="text-sm text-destructive space-y-1">
                {errorMessages.map((message, index) => (
                  <li key={index} className="list-disc list-inside">
                    {message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Form content */}
      {children}

      {/* Form actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button
          type="submit"
          disabled={isSubmitting || !isValid}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
        
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            {cancelLabel}
          </Button>
        )}
        
        {isDirty && (
          <span className="text-sm text-muted-foreground ml-auto">
            Unsaved changes
          </span>
        )}
      </div>
    </form>
  );
}

/**
 * Props for ValidatedInput component
 */
export interface ValidatedInputProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  description?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Input component with integrated validation
 */
export function ValidatedInput<T extends FieldValues>({
  form,
  name,
  label,
  description,
  required = false,
  type = 'text',
  placeholder,
  className,
  disabled = false
}: ValidatedInputProps<T>) {
  const { register, formState: { errors } } = form;
  const error = errors[name]?.message as string | undefined;

  return (
    <FormGroup
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <Input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          error && 'border-destructive focus-visible:ring-destructive'
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
    </FormGroup>
  );
}

/**
 * Props for ValidatedTextarea component
 */
export interface ValidatedTextareaProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  name: Path<T>;
  label: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  className?: string;
  disabled?: boolean;
}

/**
 * Textarea component with integrated validation
 */
export function ValidatedTextarea<T extends FieldValues>({
  form,
  name,
  label,
  description,
  required = false,
  placeholder,
  rows = 4,
  className,
  disabled = false
}: ValidatedTextareaProps<T>) {
  const { register, formState: { errors } } = form;
  const error = errors[name]?.message as string | undefined;

  return (
    <FormGroup
      label={label}
      description={description}
      error={error}
      required={required}
      className={className}
    >
      <textarea
        {...register(name)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          error && 'border-destructive focus-visible:ring-destructive'
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
    </FormGroup>
  );
}

/**
 * Hook to create a form with validation resolver
 */
export function useValidatedForm<T extends FieldValues>(
  resolver: any,
  defaultValues?: Partial<T>
) {
  return useForm<T>({
    resolver,
    defaultValues: defaultValues as any,
    mode: 'onChange', // Validate on change for better UX
    reValidateMode: 'onChange'
  });
}

// =============================================================================
// FORM VALIDATION HELPERS
// =============================================================================

/**
 * Extract field errors from form state
 */
export function getFieldErrors<T extends FieldValues>(
  form: UseFormReturn<T>
): Record<string, string> {
  const { formState: { errors } } = form;
  const fieldErrors: Record<string, string> = {};
  
  Object.entries(errors).forEach(([key, error]) => {
    if (error?.message) {
      fieldErrors[key] = error.message as string;
    }
  });
  
  return fieldErrors;
}

/**
 * Check if form has any errors
 */
export function hasFormErrors<T extends FieldValues>(
  form: UseFormReturn<T>
): boolean {
  return Object.keys(form.formState.errors).length > 0;
}

/**
 * Get all error messages as an array
 */
export function getFormErrorMessages<T extends FieldValues>(
  form: UseFormReturn<T>
): string[] {
  const { formState: { errors } } = form;
  return Object.values(errors)
    .map(error => error?.message)
    .filter(Boolean) as string[];
}
