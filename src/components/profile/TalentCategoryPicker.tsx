import { Button } from '@/components/ui/Button';
import { Field } from '@/components/forms/Field';
import { TextInput } from '@/components/forms/TextInput';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useGetTalentCategoriesReferenceQuery,
  useSyncTalentApplicationCategoriesMutation,
  useSyncTalentProfileCategoriesMutation,
} from '@/api/endpoints';
import { readApiErrorMessage } from '@/lib/apiErrors';
import {
  buildSyncPayload,
  categoryIdsFromAssignments,
  customNamesFromAssignments,
  getTalentCategoryLabel,
  hasMinimumCategories,
} from '@/lib/talentCategories';
import { cn } from '@/lib/utils';
import type { Id } from '@/api/types/common';
import type { SyncTalentCategoryItem, TalentCategoryAssignment } from '@/api/types/talentCategory';
import type { RoleApplicationStatus } from '@/types/domain';
import { Plus, X } from 'lucide-react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export type TalentCategoryPickerHandle = {
  save: () => Promise<boolean>;
  hasMinimumSelection: () => boolean;
  getSyncPayload: () => SyncTalentCategoryItem[];
};

type TalentCategoryPickerProps = {
  mode: 'application' | 'profile';
  applicationId?: Id;
  applicationStatus?: RoleApplicationStatus;
  initialCategories?: TalentCategoryAssignment[];
  disabled?: boolean;
  onSavingChange?: (saving: boolean) => void;
  onSelectionChange?: (payload: SyncTalentCategoryItem[]) => void;
};

export const TalentCategoryPicker = forwardRef<TalentCategoryPickerHandle, TalentCategoryPickerProps>(
  function TalentCategoryPicker(
    {
      mode,
      applicationId,
      applicationStatus,
      initialCategories,
      disabled = false,
      onSavingChange,
      onSelectionChange,
    },
    ref,
  ) {
    const { t, i18n } = useTranslation();
    const { data: reference = [], isLoading } = useGetTalentCategoriesReferenceQuery();
    const [syncProfileCategories, { isLoading: savingProfile }] = useSyncTalentProfileCategoriesMutation();
    const [syncApplicationCategories, { isLoading: savingApplication }] =
      useSyncTalentApplicationCategoriesMutation();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [customNames, setCustomNames] = useState<string[]>([]);
    const [customInput, setCustomInput] = useState('');
    const [error, setError] = useState<string | null>(null);

    const readOnly =
      disabled ||
      (mode === 'application' &&
        applicationStatus != null &&
        applicationStatus !== 'draft' &&
        applicationStatus !== 'rejected');

    const activeReference = useMemo(
      () => [...reference].filter((cat) => cat.is_active).sort((a, b) => a.display_order - b.display_order),
      [reference],
    );

    useEffect(() => {
      setSelectedIds(categoryIdsFromAssignments(initialCategories));
      setCustomNames(customNamesFromAssignments(initialCategories));
      setError(null);
    }, [initialCategories]);

    const saving = savingProfile || savingApplication;
    const totalSelected = selectedIds.size + customNames.length;

    const getSyncPayload = useCallback(
      () => buildSyncPayload(selectedIds, customNames, activeReference),
      [activeReference, customNames, selectedIds],
    );

    useEffect(() => {
      onSelectionChange?.(getSyncPayload());
    }, [getSyncPayload, onSelectionChange]);

    useEffect(() => {
      onSavingChange?.(saving);
    }, [onSavingChange, saving]);

    function toggleCategory(id: Id) {
      if (readOnly) return;
      const key = String(id);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
      setError(null);
    }

    function addCustomName() {
      if (readOnly) return;
      const trimmed = customInput.trim();
      if (!trimmed) return;
      const duplicatePreset = activeReference.some(
        (cat) => cat.name_en.toLowerCase() === trimmed.toLowerCase(),
      );
      if (duplicatePreset) {
        const match = activeReference.find((cat) => cat.name_en.toLowerCase() === trimmed.toLowerCase());
        if (match) toggleCategory(match.id);
        setCustomInput('');
        return;
      }
      if (customNames.some((name) => name.toLowerCase() === trimmed.toLowerCase())) {
        setCustomInput('');
        return;
      }
      setCustomNames((prev) => [...prev, trimmed]);
      setCustomInput('');
      setError(null);
    }

    function removeCustomName(name: string) {
      if (readOnly) return;
      setCustomNames((prev) => prev.filter((item) => item !== name));
    }

    const save = useCallback(async (): Promise<boolean> => {
      if (readOnly) return true;

      const payload = getSyncPayload();
      if (!hasMinimumCategories(payload.length)) {
        setError(t('categories.minRequired'));
        return false;
      }

      try {
        if (mode === 'profile') {
          await syncProfileCategories({ categories: payload }).unwrap();
        } else {
          if (!applicationId) return false;
          await syncApplicationCategories({ id: applicationId, body: { categories: payload } }).unwrap();
        }
        setError(null);
        return true;
      } catch (err) {
        toast.error(readApiErrorMessage(err, t('common.error')));
        return false;
      }
    }, [
      applicationId,
      getSyncPayload,
      mode,
      readOnly,
      syncApplicationCategories,
      syncProfileCategories,
      t,
    ]);

    useImperativeHandle(
      ref,
      () => ({
        save,
        getSyncPayload,
        hasMinimumSelection: () => hasMinimumCategories(getSyncPayload().length),
      }),
      [getSyncPayload, save],
    );

    if (isLoading) {
      return (
        <div className="space-y-3">
          <Skeleton className="h-4 w-40" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-28" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div>
          <p className="text-[13px] font-semibold text-ink">{t('categories.title')}</p>
          <p className="mt-1 text-[12px] text-ink-60">{t('categories.hint')}</p>
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label={t('categories.title')}>
          {activeReference.map((category) => {
            const active = selectedIds.has(String(category.id));
            return (
              <button
                key={category.id}
                type="button"
                disabled={readOnly || saving}
                onClick={() => toggleCategory(category.id)}
                className={cn(
                  'rounded-full border px-3.5 py-2 text-[13px] font-semibold transition-colors',
                  active
                    ? 'border-coral bg-coral/10 text-ink ring-1 ring-coral/30'
                    : 'border-ink-10 bg-white text-ink-60 hover:border-ink-20 hover:text-ink',
                  readOnly && !active ? 'opacity-50' : '',
                )}
                aria-pressed={active}
              >
                {getTalentCategoryLabel(category, i18n.language)}
              </button>
            );
          })}
        </div>

        {customNames.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {customNames.map((name) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber/10 px-3 py-1.5 text-[13px] font-semibold text-ink"
              >
                {name}
                {!readOnly ? (
                  <button
                    type="button"
                    className="rounded-full p-0.5 text-ink-40 hover:bg-white/80 hover:text-ink"
                    aria-label={t('categories.removeCustom', { name })}
                    onClick={() => removeCustomName(name)}
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </span>
            ))}
          </div>
        ) : null}

        {!readOnly ? (
          <div className="flex flex-wrap items-end gap-2">
            <Field label={t('categories.customLabel')} className="min-w-[220px] flex-1">
              <TextInput
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder={t('categories.customPlaceholder')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomName();
                  }
                }}
              />
            </Field>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={!customInput.trim() || saving}
              onClick={() => addCustomName()}
            >
              <Plus size={14} />
              {t('categories.addCustom')}
            </Button>
          </div>
        ) : null}

        {error ? (
          <p className="text-[12px] font-medium text-coral" role="alert">
            {error}
          </p>
        ) : null}

        <p className="text-[12px] text-ink-40">
          {t('categories.selectedCount', { count: totalSelected })}
        </p>
      </div>
    );
  },
);
