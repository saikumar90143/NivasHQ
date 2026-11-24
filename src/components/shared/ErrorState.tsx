import { AlertTriangle, RefreshCw, Wifi, Database } from 'lucide-react';

type ErrorType = 'generic' | 'network' | 'database' | 'notfound' | 'unauthorized';

interface ErrorStateProps {
  type?: ErrorType;
  title?: string;
  description?: string;
  onRetry?: () => void;
}

const ERROR_CONFIGS: Record<ErrorType, { title: string; description: string; icon: any }> = {
  generic: {
    title: 'Something went wrong',
    description: 'An unexpected error occurred. Please try again.',
    icon: AlertTriangle,
  },
  network: {
    title: 'Connection Error',
    description: 'Unable to connect to the server. Check your internet connection.',
    icon: Wifi,
  },
  database: {
    title: 'Data Unavailable',
    description: 'We could not load the data. Please try again in a moment.',
    icon: Database,
  },
  notfound: {
    title: 'Not Found',
    description: 'The resource you are looking for does not exist.',
    icon: AlertTriangle,
  },
  unauthorized: {
    title: 'Access Denied',
    description: 'You do not have permission to view this content.',
    icon: AlertTriangle,
  },
};

export default function ErrorState({
  type = 'generic',
  title,
  description,
  onRetry,
}: ErrorStateProps) {
  const config = ERROR_CONFIGS[type];
  const Icon = config.icon;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5"
        style={{ background: 'rgba(239, 68, 68, 0.08)' }}>
        <Icon size={32} className="text-red-500" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        {title || config.title}
      </h3>
      <p className="text-slate-500 max-w-sm mb-8 leading-relaxed">
        {description || config.description}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #0a0f1e, #1e293b)' }}
        >
          <RefreshCw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
}
