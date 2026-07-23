import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userApi } from "src/api/users";
import type { UploadableImage } from "src/types/SpotTypes";
import { QK } from "src/utils/lib/queryKeys";

export const useProfileEditor = () => {
    const qc = useQueryClient();

    const changeNickname = useMutation<string, unknown, string>({
      mutationKey: QK.mChangeNickname,
      mutationFn: (nickname) => 
        userApi.changeNickname(nickname).then((res) => res.data.data),
      onSuccess: () => qc.invalidateQueries({ queryKey: QK.sessionMe }),
    });

    const updateImg = useMutation<string, unknown, UploadableImage>({
      mutationKey: QK.mUpdateProfileImage,
      mutationFn: (file) =>
        userApi.updateProfileImg(file).then((res) => res.data.data),
      onSuccess: () => qc.invalidateQueries({ queryKey: QK.sessionMe }),
    });

    const deleteImg = useMutation<string, unknown, void>({
      mutationKey: ["DELETE /v1/users/profile"],
      mutationFn: () => userApi.deleteProfileImg().then((res) => res.data.data),
      onSuccess: () => qc.invalidateQueries({ queryKey: QK.sessionMe }),
    });

    const deleteProfileImage = async () => {
      await deleteImg.mutateAsync();
      await qc.invalidateQueries({ queryKey: QK.sessionMe });
      await qc.refetchQueries({ queryKey: QK.sessionMe });
    };

    const editSave = async (options: {
      newNickname?: string;
      originalNickname?: string;
      file?: UploadableImage | null;
    }) => {
      const nick = options.newNickname?.trim();
      const orig = (options.originalNickname ?? "").trim();

      if (nick && nick !== orig) {
        await changeNickname.mutateAsync(nick);
      }
      
      if (options.file) {
        await updateImg.mutateAsync(options.file);
      }

      await qc.invalidateQueries({ queryKey: QK.sessionMe });
      await qc.refetchQueries({ queryKey: QK.sessionMe });
    };

    return {
      changeNicknameAsync: changeNickname.mutateAsync,
      updateImgAsync: updateImg.mutateAsync,
      editSave,
      deleteProfileImage,
      isSaving: changeNickname.isPending || updateImg.isPending || deleteImg.isPending,
      isDeletingImage: deleteImg.isPending,
    }
};
