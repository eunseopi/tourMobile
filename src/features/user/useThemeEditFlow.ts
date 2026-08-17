import { useEffect, useState } from "react";
import { Alert } from "src/components/ui/AppAlert";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useChangeThemes } from "src/features/user/useChangeThemes";

type UseThemeEditFlowOptions = {
  onComplete: () => void;
};

export const USER_THEME_OPTIONS = [
  "데이트",
  "힐링",
  "반려동물",
  "사진 명소",
  "가족 여행",
  "자연",
  "한달 살이",
  "나홀로 여행",
  "맛집 탐방",
] as const;

export function useThemeEditFlow({ onComplete }: UseThemeEditFlowOptions) {
  const { data: me, isLoading, isError, refetch } = useSessionMe();
  const changeThemes = useChangeThemes();
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    if (me?.themes) setSelected(me.themes);
  }, [me?.themes]);

  const toggleTheme = (theme: string) => {
    setSelected((prev) => {
      if (prev.includes(theme)) return prev.filter((item) => item !== theme);
      if (prev.length >= 3) return [...prev.slice(1), theme];
      return [...prev, theme];
    });
  };

  const handleSave = async () => {
    if (selected.length === 0) {
      Alert.alert("입력 확인", "관심 테마를 하나 이상 선택해주세요.");
      return;
    }

    try {
      await changeThemes.mutateAsync({ themes: selected });
      Alert.alert("저장 완료", "관심 테마가 업데이트됐어요.", [
        { text: "확인", onPress: onComplete },
      ]);
    } catch (error: any) {
      Alert.alert(
        "저장 실패",
        error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해주세요.",
      );
    }
  };

  return {
    selected,
    isLoading,
    isError,
    isSaving: changeThemes.isPending,
    refetch,
    toggleTheme,
    handleSave,
  };
}
