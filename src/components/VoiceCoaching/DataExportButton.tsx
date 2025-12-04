/**
 * Data Export Button Component
 * Allows users to export all their data
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2, CheckCircle2 } from 'lucide-react';

interface DataExportButtonProps {
  userId: string;
}

export function DataExportButton({ userId }: DataExportButtonProps) {
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleExport = async (format: 'json' | 'csv' = 'json') => {
    try {
      setExporting(true);
      setExported(false);

      const response = await fetch(
        `/api/voice-coaching/export-data?userId=${userId}&format=${format}`
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from Content-Disposition header or create one
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `voice-coaching-data-${userId}-${Date.now()}.${format}`;
      
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setExported(true);
      setTimeout(() => setExported(false), 3000);
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        onClick={() => handleExport('json')}
        disabled={exporting}
        variant="outline"
        size="sm"
      >
        {exporting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Exporting...
          </>
        ) : exported ? (
          <>
            <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
            Exported!
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </>
        )}
      </Button>

      <Button
        onClick={() => handleExport('csv')}
        disabled={exporting}
        variant="outline"
        size="sm"
      >
        {exporting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Exporting...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </>
        )}
      </Button>
    </div>
  );
}

