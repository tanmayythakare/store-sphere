import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-300/80 bg-neutral-50/50 p-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-neutral-200 text-neutral-400 shadow-2xs">
        <Icon className="h-6 w-6 text-brand-primary" />
      </div>
      <h4 className="text-base font-semibold text-brand-dark">{title}</h4>
      <p className="mt-1 max-w-sm text-xs text-neutral-500">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center rounded-lg bg-brand-primary px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-brand-navy transition-all active:scale-98"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
