'use client';

import { useEffect, useState } from 'react';
import { updateChecker, UpdateCheckResult } from '@/lib/update-checker';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface UpdateNotificationProps {
  autoCheck?: boolean;
  checkInterval?: number; // in milliseconds
  showWhenUpToDate?: boolean;
}

export function UpdateNotification({
  autoCheck = true,
  checkInterval = 60 * 60 * 1000, // 1 hour
  showWhenUpToDate = false,
}: UpdateNotificationProps) {
  const [updateResult, setUpdateResult] = useState<UpdateCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (autoCheck) {
      updateChecker.setCheckInterval(checkInterval);
      
      // Initial check
      updateChecker.checkForUpdates(true).then(setUpdateResult);

      // Subscribe to updates
      const unsubscribe = updateChecker.onUpdate((result) => {
        setUpdateResult(result);
      });

      // Periodic checks
      const interval = setInterval(() => {
        updateChecker.checkForUpdates().then(setUpdateResult);
      }, checkInterval);

      return () => {
        unsubscribe();
        clearInterval(interval);
      };
    }
  }, [autoCheck, checkInterval]);

  const handleCheckNow = async () => {
    setIsChecking(true);
    try {
      const result = await updateChecker.checkForUpdates(true);
      setUpdateResult(result);
    } finally {
      setIsChecking(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    // Store dismissal in localStorage
    if (updateResult?.latestVersion) {
      localStorage.setItem(
        `update-dismissed-${updateResult.latestVersion}`,
        'true'
      );
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  // Don't show if dismissed
  if (dismissed) return null;

  // Don't show if no update and not showing up-to-date message
  if (!updateResult?.hasUpdate && !showWhenUpToDate) return null;

  // Check if this version was dismissed
  if (updateResult?.latestVersion) {
    const dismissedKey = `update-dismissed-${updateResult.latestVersion}`;
    if (localStorage.getItem(dismissedKey) === 'true') {
      return null;
    }
  }

  return (
    <Card
      className={`fixed bottom-4 right-4 z-50 w-full max-w-md shadow-lg border-2 ${
        updateResult?.hasUpdate
          ? updateResult.updateInfo?.critical
            ? 'border-red-300 bg-red-50'
            : 'border-blue-300 bg-blue-50'
          : 'border-green-300 bg-green-50'
      } animate-fade-in`}
      role="alert"
      aria-live="polite"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            {updateResult?.hasUpdate ? (
              updateResult.updateInfo?.critical ? (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <RefreshCw className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              )
            ) : (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold">
                {updateResult?.hasUpdate
                  ? updateResult.updateInfo?.critical
                    ? 'Critical Update Available'
                    : 'Update Available'
                  : 'App is Up to Date'}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {updateResult?.hasUpdate
                  ? `Version ${updateResult.latestVersion} is available. You're on ${updateResult.currentVersion}.`
                  : `You're running the latest version (${updateResult?.currentVersion}).`}
              </CardDescription>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 flex-shrink-0"
            aria-label="Dismiss update notification"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {updateResult?.hasUpdate && updateResult.updateInfo?.changelog && (
        <CardContent className="pt-0 pb-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-700 mb-2">What's new:</p>
            <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
              {updateResult.updateInfo.changelog.slice(0, 3).map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}

      <CardContent className="pt-0 flex gap-2">
        {updateResult?.hasUpdate ? (
          <>
            <Button
              onClick={handleReload}
              size="sm"
              className="flex-1 bg-black hover:bg-gray-900 text-white"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Now
            </Button>
            <Button
              onClick={handleCheckNow}
              variant="outline"
              size="sm"
              disabled={isChecking}
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </>
        ) : (
          <Button
            onClick={handleCheckNow}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isChecking}
          >
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Check for Updates
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

