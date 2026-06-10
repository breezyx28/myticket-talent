import { FileUploadButton } from '@/components/profile/FileUploadButton';
import type { TalentApplicationMedia } from '@/api/types/roleApplication';
import type { TalentProfileGalleryItem } from '@/api/types/talent';
import { Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

type MediaKind = 'image' | 'video' | 'certificate';

export function TalentMediaGalleryEditor({
  applicationMedia,
  profileGallery,
  canEdit,
  uploading,
  onUpload,
  onDelete,
}: {
  applicationMedia: TalentApplicationMedia[];
  profileGallery: TalentProfileGalleryItem[];
  canEdit: boolean;
  uploading?: boolean;
  onUpload: (file: File, kind: MediaKind) => void;
  onDelete?: (mediaId: string | number) => void;
}) {
  const { t } = useTranslation();

  const hasItems = applicationMedia.length > 0 || profileGallery.length > 0;

  return (
    <div className="space-y-4">
      {canEdit ? (
        <div className="flex flex-wrap gap-2">
          {(['image', 'video', 'certificate'] as const).map((kind) => (
            <FileUploadButton
              key={kind}
              label={t(`profile.mediaKind.${kind}`)}
              accept={kind === 'image' || kind === 'certificate' ? 'image/*,.pdf' : 'video/*,image/*'}
              loading={uploading}
              disabled={!canEdit}
              onFile={(file) => onUpload(file, kind)}
            />
          ))}
        </div>
      ) : null}

      {!hasItems ? (
        <p className="rounded-2xl border border-dashed border-ink-20 bg-ink-5/40 px-4 py-6 text-center text-[13px] text-ink-60">
          {t('profile.noMedia')}
        </p>
      ) : null}

      {profileGallery.length > 0 ? (
        <div>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-40">
            {t('profile.liveGallery')}
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {profileGallery.map((item) => (
              <figure key={item.id} className="overflow-hidden rounded-2xl border border-ink-10 bg-white">
                <img
                  src={item.image_url}
                  alt={item.caption ?? ''}
                  className="aspect-square w-full object-cover"
                />
                {item.caption ? (
                  <figcaption className="truncate px-2 py-1.5 text-[11px] text-ink-60">{item.caption}</figcaption>
                ) : null}
              </figure>
            ))}
          </div>
        </div>
      ) : null}

      {applicationMedia.length > 0 ? (
        <div>
          <p className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-ink-40">
            {t('profile.applicationMedia')}
          </p>
          <ul className="space-y-2">
            {applicationMedia.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-ink-10 bg-white px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-ink">{item.label ?? t(`profile.mediaKind.${item.kind}`)}</p>
                  <a
                    href={item.value}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-0.5 block truncate text-[11px] text-coral hover:underline"
                    dir="ltr"
                  >
                    {item.value}
                  </a>
                </div>
                {canEdit && onDelete ? (
                  <button
                    type="button"
                    className="shrink-0 rounded-full p-1.5 text-coral hover:bg-coral/10"
                    onClick={() => onDelete(item.id)}
                    aria-label={t('profile.removeMedia')}
                  >
                    <Trash2 size={14} />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
