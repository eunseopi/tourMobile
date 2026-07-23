import { useEffect, useState } from "react";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { RootStackParamList } from "src/app/navigation/types";
import { commonStyles } from "src/design/commonStyles";
import { colors, layout, typography } from "src/design/theme";
import { useSessionMe } from "src/features/my-page/useSessionMe";
import { useChangeThemes } from "src/features/user/useChangeThemes";

type Props = NativeStackScreenProps<RootStackParamList, "ThemeEdit">;

const THEME_OPTIONS = [
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

export default function ThemeEditScreen({ navigation }: Props) {
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
        { text: "확인", onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert(
        "저장 실패",
        error?.response?.data?.message ?? error?.message ?? "잠시 후 다시 시도해주세요."
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary[400]} />
        <Text style={styles.mutedText}>관심 테마를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>관심 테마를 불러오지 못했어요.</Text>
        <Pressable style={commonStyles.primaryButton} onPress={() => refetch()}>
          <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={commonStyles.screen}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.themeGrid}>
          {THEME_OPTIONS.map((theme) => {
            const active = selected.includes(theme);
            return (
              <Pressable
                key={theme}
                style={[styles.themeItem, active && styles.themeItemActive]}
                onPress={() => toggleTheme(theme)}
              >
                <Text style={[styles.themeText, active && styles.themeTextActive]}>
                  {theme}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.alertBox}>
          <Text style={styles.alertText}>관심 테마는 최대 3개까지 선택할 수 있어요.</Text>
        </View>
      </ScrollView>

      <View style={commonStyles.bottomAction}>
        <Pressable
          style={({ pressed }) => [
            commonStyles.primaryButton,
            pressed && commonStyles.primaryButtonPressed,
            changeThemes.isPending && commonStyles.primaryButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={changeThemes.isPending}
        >
          {changeThemes.isPending ? (
            <ActivityIndicator color={colors.base[0]} />
          ) : (
            <Text style={commonStyles.primaryButtonText}>수정하기</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 59,
    paddingBottom: 132,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
  },
  themeItem: {
    width: "30.8%",
    minHeight: 68,
    paddingVertical: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.bg[0],
    alignItems: "center",
    justifyContent: "center",
  },
  themeItemActive: {
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[50],
  },
  themeText: {
    ...typography.body3,
    color: colors.gray[500],
    textAlign: "center",
  },
  themeTextActive: {
    color: colors.primary[400],
  },
  alertBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 32,
  },
  alertText: {
    ...typography.body3,
    color: colors.gray[500],
    textAlign: "center",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.bg[0],
  },
  mutedText: {
    ...typography.body4,
    color: colors.gray[500],
  },
  errorText: {
    ...typography.body3,
    color: colors.error[100],
  },
});
