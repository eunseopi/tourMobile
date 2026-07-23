import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";
import { USER_THEME_OPTIONS } from "src/features/user/useThemeEditFlow";

type Props = {
  selected: string[];
  onToggleTheme: (theme: string) => void;
};

export function ThemeSelectionGrid({ selected, onToggleTheme }: Props) {
  return (
    <>
      <View style={styles.themeGrid}>
        {USER_THEME_OPTIONS.map((theme) => {
          const active = selected.includes(theme);
          return (
            <Pressable
              key={theme}
              style={[styles.themeItem, active && styles.themeItemActive]}
              onPress={() => onToggleTheme(theme)}
            >
              <Text style={[styles.themeText, active && styles.themeTextActive]}>{theme}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.alertBox}>
        <Text style={styles.alertText}>관심 테마는 최대 3개까지 선택할 수 있어요.</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
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
});
