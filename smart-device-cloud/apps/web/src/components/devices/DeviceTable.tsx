import { useState } from 'react';
import { flexRender, type ColumnDef } from '@tanstack/react-table';
import { getCoreRowModel, getSortedRowModel, useLegacyTable } from '@tanstack/react-table/legacy';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface DeviceTableProps {
  devices: any[];
  isLoading: boolean;
  onDeviceCommand: (deviceId: string, command: string, payload?: any) => void;
}

export function DeviceTable({ devices, isLoading, onDeviceCommand }: DeviceTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const columns: ColumnDef<any, any>[] = [
    {
      accessorKey: 'name',
      header: 'Device',
      cell: ({ row }: { row: any }) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="text-lg">{row.original?.model?.charAt(0) || 'D'}</span>
          </div>
          <div>
            <div className="font-medium">{row.getValue('name')}</div>
            <div className="text-sm text-muted-foreground">{row.original?.model}</div>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'serialNumber',
      header: 'Serial',
      cell: ({ row }: { row: any }) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">{row.getValue('serialNumber')}</code>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: { row: any }) => <span>{row.getValue('status')}</span>,
    },
    {
      accessorKey: 'healthStatus',
      header: 'Health',
      cell: ({ row }: { row: any }) => {
        const status = row.getValue('healthStatus') as string;
        return (
          <Badge
            variant={
              status === 'healthy' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'
            }
            className="flex items-center gap-1"
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                status === 'healthy'
                  ? 'bg-green-500'
                  : status === 'warning'
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
              }`}
            />
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'batteryLevel',
      header: 'Battery',
      cell: ({ row }: { row: any }) => {
        const level = row.getValue('batteryLevel') as number;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  level > 50 ? 'bg-green-500' : level > 20 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${level}%` }}
              />
            </div>
            <span className="text-sm">{level}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'lastSeen',
      header: 'Last Seen',
      cell: ({ row }: { row: any }) => {
        const date = row.getValue('lastSeen') as string;
        return new Date(date).toLocaleDateString();
      },
    },
    {
      id: 'actions',
      cell: ({ row }: { row: any }) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeviceCommand(row.original?.id, 'info')}
          >
            Info
          </Button>
        </div>
      ),
    },
  ];

  const table = useLegacyTable({
    data: devices,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="h-96 animate-pulse bg-muted" />
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup: any) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header: any) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row: any) => (
            <TableRow key={row.id} className="hover:bg-muted/50">
              {row.getVisibleCells().map((cell: any) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {table.getRowCount() === 0 && (
        <div className="p-8 text-center text-muted-foreground">No devices found</div>
      )}

      <div className="flex items-center justify-between p-4 border-t">
        <div className="text-sm text-muted-foreground">
          Showing page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} (
          {table.getRowCount()} devices)
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                {table.getState().pagination.pageSize} rows
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {[5, 10, 20, 50, 100].map(size => (
                <DropdownMenuItem key={size} onClick={() => table.setPageSize(size)}>
                  {size} rows
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
