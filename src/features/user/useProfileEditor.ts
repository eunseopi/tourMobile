import { useMutation, useQueryClient } from "@tanstack/react-query"
import { userApi } from "src/api/users";
import { QK } from "src/utils/lib/queryKeys";

export const useProfileEditor = () => {
    const qc = useQueryClient();

    const changeNickname = useMutation<string, unknown, string>({
      mutationKey: QK.mChangeNickname,
      mutationFn: (nickname) => 
        userApi.changeNickname(nickname).then((res) => res.data.data),
      onSuccess: () => qc.invalidateQueries({ queryKey: QK.sessionMe }),
    });

    const updateImg = useMutation<string, unknown, File | Blob>({
      mutationKey: QK.mUpdateProfileImage,
      mutationFn: (file) =>
        userApi.updateProfileImg(file).then((res) => res.data.data),
      onSuccess: () => qc.invalidateQueries({ queryKey: QK.sessionMe }),
    });

    const editSave = async (options: {
      newNickname?: string;
      originalNickname?: string;
      file?: File | Blob | null;
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
      isSaving: changeNickname.isPending || updateImg.isPending,
    }
};