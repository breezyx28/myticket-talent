import { StatusPill } from '@/components/talent/StatusPill';
import { cn } from '@/lib/utils';
import type { RoleApplicationStatus } from '@/types/domain';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

const BANNER_CLASS: Record<string, string> = {
  draft: 'border-ink-10 bg-ink-5/60',
  submitted: 'border-sky/40 bg-sky/15',
  approved: 'border-mint/40 bg-mint/15',
  rejected: 'border-coral/30 bg-coral/10',
  not_started: 'border-ink-10 bg-ink-5/60',
};

const STATUS_KEY: Record<string, string> = {
  draft: 'application.status_draft',
  submitted: 'application.status_submitted',
  rejected: 'application.status_rejected',
  approved: 'application.status_approved',
  not_started: 'application.status_not_started',
};

export function ApplicationStatusBanner({
  status,
  message,
  children,
  className,
}: {
  status: RoleApplicationStatus;
  message?: string;
  children?: ReactNode;
  className?: string;
}) {
  const { t } = useTranslation();
  const body = message ?? (STATUS_KEY[status] ? t(STATUS_KEY[status]) : status);
  const statusLabel = STATUS_KEY[status] ? t(STATUS_KEY[status]) : status;

  return (
    <div className={cn('rounded-2xl border p-5', BANNER_CLASS[status] ?? BANNER_CLASS.draft, className)}>
      <div className="flex flex-wrap items-center gap-3">
        <StatusPill status={status} label={statusLabel} kind="application" />
        <p className="text-[14px] font-medium text-ink">{body}</p>
      </div>
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
