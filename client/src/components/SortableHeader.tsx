import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

interface SortableHeaderProps {
  label: string;
  columnKey: string;
  currentSortBy: string;
  currentOrder: 'asc' | 'desc';
  onSort: (column: string) => void;
  className?: string;
}

export function SortableHeader({
  label,
  columnKey,
  currentSortBy,
  currentOrder,
  onSort,
  className = '',
}: SortableHeaderProps) {
  const isSorted = currentSortBy === columnKey;

  return (
    <th
      onClick={() => onSort(columnKey)}
      className={`cursor-pointer px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 hover:text-brand-dark transition-colors select-none ${className}`}
    >
      <div className="flex items-center gap-1.5 group">
        <span>{label}</span>
        <span className="text-neutral-400 group-hover:text-brand-primary transition-colors">
          {!isSorted && <ArrowUpDown className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />}
          {isSorted && currentOrder === 'asc' && (
            <ArrowUp className="h-3.5 w-3.5 text-brand-primary" />
          )}
          {isSorted && currentOrder === 'desc' && (
            <ArrowDown className="h-3.5 w-3.5 text-brand-primary" />
          )}
        </span>
      </div>
    </th>
  );
}
