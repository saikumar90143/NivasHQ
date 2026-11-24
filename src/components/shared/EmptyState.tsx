import { LucideIcon } from 'lucide-react';
import { SearchX, Building2, Users, FileX } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
  };
  variant?: 'default' | 'search' | 'properties' | 'leads';
}

const VARIANT_ICONS: Record<string, LucideIcon> = {
  search: SearchX,
  properties: Building2,
  leads: Users,
  default: FileX,
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'default',
}: EmptyStateProps) {
  const DefaultIcon = VARIANT_ICONS[variant] || FileX;
  const RenderIcon = Icon || DefaultIcon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-100 mb-5">
        <RenderIcon size={36} className="text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">{description}</p>
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            action.href ? (
              <Link
                href={action.href}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #0a0f1e, #1e293b)' }}
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #0a0f1e, #1e293b)' }}
              >
                {action.label}
              </button>
            )
          )}
          {secondaryAction && (
            <Link
              href={secondaryAction.href || '/'}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-xl font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
