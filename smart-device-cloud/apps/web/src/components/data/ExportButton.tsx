/**
 * ExportButton - Data export control
 */

import { Download } from 'lucide-react';
import { useState } from 'react';

interface ExportButtonProps {
  data: any[];
  filename?: string;
  format?: 'csv' | 'json';
}

export function ExportButton({ data, filename = 'export', format = 'csv' }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      let content: string;
      let type: string;

      if (format === 'csv') {
        // Convert to CSV
        if (data.length === 0) return;
        const headers = Object.keys(data[0]);
        const rows = data.map(item =>
          headers
            .map(header => {
              const value = item[header];
              if (typeof value === 'string' && value.includes(',')) {
                return `"${value}"`;
              }
              return value;
            })
            .join(',')
        );
        content = [headers.join(','), ...rows].join('\n');
        type = 'text/csv';
      } else {
        // JSON export
        content = JSON.stringify(data, null, 2);
        type = 'application/json';
      }

      // Trigger download
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading || data.length === 0}
      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
    >
      <Download className="h-4 w-4" />
      Export {format.toUpperCase()}
    </button>
  );
}
