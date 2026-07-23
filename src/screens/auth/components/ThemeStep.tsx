import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";

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

type Props = {
  selectedThemes: string[];
  onToggleTheme: (theme: string) => void;
};

export function ThemeStep({ selectedThemes, onToggleTheme }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.label}>관심 테마</Text>
      <Text style={styles.helperText}>최대 3개까지 선택할 수 있어요.</Text>
      <View style={styles.themeGrid}>
        {THEME_OPTIONS.map((theme) => {
          const active = selectedThemes.includes(theme);
          return (
            <Pressable
              key={theme}
              style={[styles.themeChip, active && styles.themeChipActive]}
              onPress={() => onToggleTheme(theme)}
            >
              <Text style={[styles.themeChipText, active && styles.themeChipTextActive]}>{theme}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    minHeight: 360,
  },
  label: {
    ...typography.body3,
    color: colors.gray[700],
  },
  helperText: {
    marginTop: 6,
    ...typography.caption2,
    color: colors.gray[500],
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
    marginTop: 59,
  },
  themeChip: {
    width: "30.8%",
    minHeight: 68,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg[0],
  },
  themeChipActive: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
  },
  themeChipText: {
    ...typography.body3,
    color: colors.gray[500],
    textAlign: "center",
  },
  themeChipTextActive: {
    color: colors.primary[400],
  },
});
