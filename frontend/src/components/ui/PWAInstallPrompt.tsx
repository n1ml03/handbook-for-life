import { usePWAInstall } from '@/hooks/useOnlineStatus';
import { Download, X, Smartphone, Monitor } from 'lucide-react';
import { useState } from 'react';

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  // Don't show if already installed, not installable, or dismissed
  if (isInstalled || !isInstallable || dismissed) return null;

  const handleInstall = async () => {
    const success = await installPWA();
    if (!success) {
      setDismissed(true);
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="bg-white/20 rounded-lg p-2">
            <Download size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-sm">Install Handbook</h3>
            <p className="text-xs opacity-90 mt-1">
              Get quick access and work offline by installing our app on your device.
            </p>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="flex items-center gap-4 mt-3 mb-3">
          <div className="flex items-center gap-2 text-xs opacity-90">
            <Smartphone size={14} />
            <span>Mobile</span>
          </div>
          <div className="flex items-center gap-2 text-xs opacity-90">
            <Monitor size={14} />
            <span>Desktop</span>
          </div>
          <div className="flex items-center gap-2 text-xs opacity-90">
            <Download size={14} />
            <span>Offline</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleInstall}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex-1"
          >
            Install App
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/80 px-3 py-2 rounded-lg text-sm hover:text-white transition-colors"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}

export function PWAInstallButton() {
  const { isInstallable, isInstalled, installPWA } = usePWAInstall();

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <Download size={16} />
        <span>App Installed</span>
      </div>
    );
  }

  if (!isInstallable) {
    return null;
  }

  return (
    <button
      onClick={installPWA}
      className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
    >
      <Download size={16} />
      <span>Install App</span>
    </button>
  );
}
