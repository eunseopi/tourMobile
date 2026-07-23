import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";
import { POST_THEME_OPTIONS } from "src/features/community/usePostWriteFlow";

type Props = {
  themeId: number;
  onSelectTheme: (themeId: number) => void;
};

export function PostWriteThemeSection({ themeId, onSelectTheme }: Props) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>테마를 선택해주세요.</Text>
      <View style={styles.themeGrid}>
        {POST_THEME_OPTIONS.map((item) => {
          const active = themeId === item.id;
          return (
            <Pressable
              key={item.id}
              style={[styles.themeChip, active && styles.themeChipActive]}
              onPress={() => onSelectTheme(item.id)}
            >
              <Text style={[styles.themeChipText, active && styles.themeChipTextActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 22,
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
  },
  sectionTitle: {
    ...typography.head4,
    color: colors.gray[800],
    marginBottom: 10,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
  },
  themeChip: {
    width: "30.8%",
    minHeight: 68,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.bg[0],
  },
  themeChipActive: {
    borderColor: colors.primary[300],
    backgroundColor: colors.primary[50],
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
