import { useServiceWorkerUpdate } from '@/hooks/useOnlineStatus';
import { Download, X } from 'lucide-react';
import { useState } from 'react';

export function PWAUpdateNotification() {
  const { updateAvailable, applyUpdate } = useServiceWorkerUpdate();
  const [dismissed, setDismissed] = useState(false);

  if (!updateAvailable || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-blue-500 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <Download size={20} className="mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Update Available</h3>
            <p className="text-xs opacity-90 mt-1">
              A new version of the app is ready. Restart to get the latest features and improvements.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={applyUpdate}
            className="bg-white text-blue-500 px-3 py-1.5 rounded text-sm font-medium hover:bg-blue-50 transition-colors"
          >
            Update Now
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/80 px-3 py-1.5 rounded text-sm hover:text-white transition-colors"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  );
}
