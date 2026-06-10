import {
  useAddTalentMediaMutation,
  useDeleteTalentMediaMutation,
  useUpdateTalentApplicationMutation,
  useUpdateTalentProfileMutation,
} from '@/api/endpoints';
import { readApiErrorMessage } from '@/lib/apiErrors';
import { canEditTalentApplication } from '@/lib/roleApplicationEdit';
import { uploadToCdn } from '@/lib/upload';
import type { RoleApplicationStatus } from '@/types/domain';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

type MediaKind = 'image' | 'video' | 'certificate';

export function useTalentProfileUploads(input: {
  applicationId?: string | number | null;
  applicationStatus?: RoleApplicationStatus | null;
  mediaCount?: number;
}) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [updateProfile] = useUpdateTalentProfileMutation();
  const [updateApplication] = useUpdateTalentApplicationMutation();
  const [addMedia] = useAddTalentMediaMutation();
  const [deleteMedia] = useDeleteTalentMediaMutation();

  const canEditApplication = canEditTalentApplication(input.applicationStatus);

  const uploadProfileImage = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const { url } = await uploadToCdn(file);

        if (canEditApplication && input.applicationId) {
          await updateApplication({ id: input.applicationId, body: { profile_image: url } }).unwrap();
        } else {
          await updateProfile({ profile_image: url }).unwrap();
        }

        toast.success(t('common.saved'));
      } catch (err) {
        toast.error(readApiErrorMessage(err, t('profile.imageUpdateFailed')));
      } finally {
        setUploading(false);
      }
    },
    [canEditApplication, input.applicationId, t, updateApplication, updateProfile],
  );

  const uploadMedia = useCallback(
    async (file: File, kind: MediaKind) => {
      if (!input.applicationId) {
        toast.error(t('profile.mediaUpdateFailed'));
        return;
      }

      setUploading(true);
      try {
        const { url } = await uploadToCdn(file);
        await addMedia({
          id: input.applicationId,
          body: { kind, value: url, position: input.mediaCount ?? 0 },
        }).unwrap();
        toast.success(t('common.saved'));
      } catch (err) {
        toast.error(readApiErrorMessage(err, t('profile.mediaUpdateFailed')));
      } finally {
        setUploading(false);
      }
    },
    [addMedia, input.applicationId, input.mediaCount, t],
  );

  const removeMedia = useCallback(
    async (mediaId: string | number) => {
      if (!input.applicationId) return;
      try {
        await deleteMedia({ id: input.applicationId, mediaId }).unwrap();
        toast.success(t('common.saved'));
      } catch (err) {
        toast.error(readApiErrorMessage(err, t('common.error')));
      }
    },
    [deleteMedia, input.applicationId, t],
  );

  return {
    uploading,
    canEditApplication,
    uploadProfileImage,
    uploadMedia,
    removeMedia,
  };
}
