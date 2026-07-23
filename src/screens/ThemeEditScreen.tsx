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
import type { RootStackParamList } from "../../App";
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
        <ActivityIndicator color="#ff8b4c" />
        <Text style={styles.mutedText}>관심 테마를 불러오는 중...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>관심 테마를 불러오지 못했어요.</Text>
        <Pressable style={styles.primaryButton} onPress={() => refetch()}>
          <Text style={styles.primaryButtonText}>다시 시도</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>관심 테마</Text>
      <Text style={styles.description}>최대 3개까지 선택할 수 있어요.</Text>

      <View style={styles.themeGrid}>
        {THEME_OPTIONS.map((theme) => {
          const active = selected.includes(theme);
          return (
            <Pressable
              key={theme}
              style={[styles.themeChip, active && styles.themeChipActive]}
              onPress={() => toggleTheme(theme)}
            >
              <Text style={[styles.themeChipText, active && styles.themeChipTextActive]}>
                {theme}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable
        style={[styles.primaryButton, changeThemes.isPending && styles.primaryButtonDisabled]}
        onPress={handleSave}
        disabled={changeThemes.isPending}
      >
        {changeThemes.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>저장하기</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: "900",
    color: "#191919",
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: "#777",
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 22,
  },
  themeChip: {
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
  },
  themeChipActive: {
    backgroundColor: "#ffeddc",
    borderWidth: 1,
    borderColor: "#ffb585",
  },
  themeChipText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#555",
  },
  themeChipTextActive: {
    color: "#b6612c",
  },
  primaryButton: {
    marginTop: 28,
    minHeight: 54,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#fff",
  },
  mutedText: {
    marginTop: 10,
    color: "#777",
  },
  errorText: {
    color: "#d14b4b",
    fontWeight: "700",
  },
});
