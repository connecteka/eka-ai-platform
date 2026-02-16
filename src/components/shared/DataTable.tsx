import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  onRowClick?: (row: T) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  pagination?: {
    page: number;
    perPage: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sortable?: boolean;
  rowActions?: (row: T) => React.ReactNode;
}

function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  isLoading = false,
  emptyMessage = 'No data found',
  pagination,
  sortable = true,
  rowActions
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    if (!sortable) return;
    setSortConfig(current => {
      if (!current || current.key !== key) return { key, direction: 'asc' };
      if (current.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  const sortedData = React.useMemo(() => {
    if (!sortConfig) return data;
    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortConfig.key];
      const bValue = (b as any)[sortConfig.key];
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.perPage) : 1;

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="animate-pulse flex flex-col gap-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-stone-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
        <table className="w-full text-left">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone-500
                    ${column.sortable !== false && sortable ? 'cursor-pointer hover:text-stone-800' : ''}
                    ${column.width ? column.width : ''}
                  `}
                  style={{ width: column.width }}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1.5">
                    {column.header}
                    {sortable && column.sortable !== false && sortConfig?.key === column.key && (
                      sortConfig.direction === 'asc' 
                        ? <ChevronUp className="w-3.5 h-3.5" />
                        : <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </div>
                </th>
              ))}
              {rowActions && <th className="px-4 py-3 w-16"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {sortedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (rowActions ? 1 : 0)} 
                  className="px-4 py-12 text-center text-stone-400 text-sm"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  onClick={() => onRowClick?.(row)}
                  className={`
                    transition-colors
                    ${onRowClick ? 'cursor-pointer hover:bg-stone-50' : ''}
                  `}
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3">
                      {column.render 
                        ? column.render(row)
                        : <span className="text-sm text-stone-700">{(row as any)[column.key]}</span>
                      }
                    </td>
                  ))}
                  {rowActions && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      {rowActions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-sm text-stone-500">
            Showing {((pagination.page - 1) * pagination.perPage) + 1} - {Math.min(pagination.page * pagination.perPage, pagination.total)} of {pagination.total}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-stone-500 px-2">
              Page {pagination.page} of {totalPages}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages}
              className="p-2 rounded-lg border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
