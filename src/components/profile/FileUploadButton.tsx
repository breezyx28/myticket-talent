import { Loader2, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function FileUploadButton({
  label,
  accept,
  disabled,
  loading,
  onFile,
}: {
  label: string;
  accept?: string;
  disabled?: boolean;
  loading?: boolean;
  onFile: (file: File) => void;
}) {
  const { t } = useTranslation();

  return (
    <label
      className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-ink-10 bg-white px-4 py-2 text-[13px] font-semibold text-ink transition-colors hover:bg-ink-5 disabled:cursor-not-allowed disabled:opacity-50"
      aria-busy={loading}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
      {loading ? t('common.saving') : label}
      <input
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled || loading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) onFile(file);
        }}
      />
    </label>
  );
}
