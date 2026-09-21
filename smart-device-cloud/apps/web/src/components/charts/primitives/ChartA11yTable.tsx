import { cn } from '@/lib/utils';

export interface A11yColumn {
  key: string;
  label: string;
  format?: (value: unknown) => string;
}

interface ChartA11yTableProps {
  caption: string;
  columns: A11yColumn[];
  rows: Array<Record<string, unknown>>;
  className?: string;
}

/**
 * Screen-reader-only data table.
 *
 * Recharts SVGs are opaque to assistive tech. Rendering the underlying data
 * as a hidden <table> gives keyboard and screen-reader users the same
 * information the chart conveys visually.
 */
export function ChartA11yTable({
  caption,
  columns,
  rows,
  className,
}: ChartA11yTableProps) {
  return (
    <table className={cn('sr-only', className)}>
      <caption>{caption}</caption>
      <thead>
        <tr>
          {columns.map(c => (
            <th key={c.key} scope="col">
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            {columns.map(c => {
              const raw = row[c.key];
              return (
                <td key={c.key}>
                  {c.format ? c.format(raw) : String(raw ?? '')}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
