import { Badge } from '@/components/ui/Badge';
import { getTalentCategoryLabel } from '@/lib/talentCategories';
import { cn } from '@/lib/utils';
import type { TalentCategoryAssignment } from '@/api/types/talentCategory';
import { useTranslation } from 'react-i18next';

export function TalentCategoryBadges({
  categories,
  className,
  emptyLabel,
}: {
  categories?: TalentCategoryAssignment[] | null;
  className?: string;
  emptyLabel?: string;
}) {
  const { i18n, t } = useTranslation();
  const list = categories ?? [];

  if (list.length === 0) {
    return emptyLabel ? (
      <p className={cn('text-[13px] text-ink-40', className)}>{emptyLabel}</p>
    ) : null;
  }

  return (
    <div className={cn('flex flex-wrap gap-2', className)} aria-label={t('categories.title')}>
      {list.map((category) => (
        <Badge
          key={`${category.id}-${category.talent_category_id}`}
          variant={category.is_custom ? 'warning' : 'default'}
          className="normal-case tracking-normal"
        >
          {getTalentCategoryLabel(category, i18n.language)}
        </Badge>
      ))}
    </div>
  );
}
