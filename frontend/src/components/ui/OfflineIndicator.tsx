import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff, Wifi } from 'lucide-react';
import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showIndicator, setShowIndicator] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowIndicator(true);
      setWasOffline(true);
    } else if (wasOffline) {
      // Show "back online" message briefly
      setShowIndicator(true);
      const timer = setTimeout(() => {
        setShowIndicator(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (!showIndicator) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
        isOnline
          ? 'bg-green-500 text-white'
          : 'bg-red-500 text-white'
      }`}
    >
      <div className="flex items-center gap-2">
        {isOnline ? (
          <>
            <Wifi size={16} />
            <span className="text-sm font-medium">Back online</span>
          </>
        ) : (
          <>
            <WifiOff size={16} />
            <span className="text-sm font-medium">You're offline</span>
          </>
        )}
      </div>
    </div>
  );
}

export function OfflineFallback({ children }: { children: React.ReactNode }) {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
      <WifiOff size={48} className="text-gray-400 mb-4" />
      <h2 className="text-xl font-semibold text-gray-700 mb-2">
        You're offline
      </h2>
      <p className="text-gray-500 mb-4 max-w-md">
        This content requires an internet connection. Please check your network and try again.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
