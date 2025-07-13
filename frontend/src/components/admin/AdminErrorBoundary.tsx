import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error details
    console.error('AdminErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In production, you might want to log this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <Card className="max-w-2xl w-full">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Something went wrong in the Admin Panel
              </h2>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We encountered an unexpected error while loading the admin interface. 
                This has been logged and our team will investigate the issue.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground mb-2">
                    <Bug className="w-4 h-4 inline mr-2" />
                    Error Details (Development)
                  </summary>
                  <div className="bg-muted/50 rounded-lg p-4 text-xs font-mono overflow-auto max-h-40">
                    <div className="text-red-600 font-semibold mb-2">
                      {this.state.error.name}: {this.state.error.message}
                    </div>
                    <div className="text-muted-foreground whitespace-pre-wrap">
                      {this.state.error.stack}
                    </div>
                    {this.state.errorInfo && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <div className="text-amber-600 font-semibold mb-2">Component Stack:</div>
                        <div className="text-muted-foreground whitespace-pre-wrap">
                          {this.state.errorInfo.componentStack}
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Error ID for Support */}
              <div className="mb-6 p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Error ID: <code className="font-mono text-foreground">{this.state.errorId}</code>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please include this ID when reporting the issue.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={this.handleRetry}
                  className="bg-accent-cyan/10 text-accent-cyan hover:bg-accent-cyan/20 border border-accent-cyan/30"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="outline"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reload Page
                </Button>
                
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>

              {/* Additional Help */}
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  If this problem persists, please try clearing your browser cache or contact support.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withAdminErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorHandler?: (error: Error, errorInfo: ErrorInfo) => void
) {
  return function WrappedComponent(props: P) {
    return (
      <AdminErrorBoundary onError={errorHandler}>
        <Component {...props} />
      </AdminErrorBoundary>
    );
  };
}

// Hook for error reporting
export function useErrorHandler() {
  const reportError = (error: Error, context?: string) => {
    console.error(`Error in ${context || 'Admin Panel'}:`, error);
    
    // In production, send to error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: errorReportingService.captureException(error, { context });
    }
  };

  return { reportError };
}

export default AdminErrorBoundary;
