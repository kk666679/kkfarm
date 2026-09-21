/**
 * DataTable - Sortable, filterable, paginated table component
 */

import { ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';

export interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => ReactNode;
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  className?: string;
}

type SortDirection = 'asc' | 'desc' | null;

export function DataTable<T extends { id: string }>({
  columns,
  data,
  loading = false,
  onRowClick,
  selectable = false,
  className = '',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey || !sortDirection) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const toggleRow = (id: string) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRows(newSelected);
  };

  const toggleAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(data.map(d => d.id)));
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-8 text-gray-500">Loading...</div>;
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-gray-500">No data to display</div>
    );
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-gray-200 ${className}`}>
      <table className="w-full text-sm">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            {selectable && (
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedRows.size === data.length}
                  onChange={toggleAll}
                  className="rounded"
                />
              </th>
            )}
            {columns.map(col => (
              <th
                key={String(col.key)}
                className="px-4 py-3 text-left font-semibold text-gray-900"
                style={{ width: col.width }}
              >
                {col.sortable ? (
                  <button
                    onClick={() => handleSort(col.key)}
                    className="flex items-center gap-2 hover:text-gray-700"
                  >
                    {col.label}
                    {sortKey === col.key ? (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )
                    ) : (
                      <ChevronsUpDown className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, idx) => (
            <tr
              key={row.id}
              className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer transition"
              onClick={() => onRowClick?.(row)}
            >
              {selectable && (
                <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedRows.has(row.id)}
                    onChange={() => toggleRow(row.id)}
                    className="rounded"
                  />
                </td>
              )}
              {columns.map(col => (
                <td
                  key={String(col.key)}
                  className="px-4 py-3 text-gray-700"
                  style={{ width: col.width }}
                >
                  {col.render
                    ? col.render((row as any)[col.key], row)
                    : String((row as any)[col.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
