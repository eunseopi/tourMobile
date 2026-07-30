import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "src/design/theme";
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "600",
    color: colors.gray[800],
    marginBottom: 12,
  },
  themeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  themeChip: {
    minWidth: 56,
    maxWidth: 140,
    height: 36,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[200],
  },
  themeChipActive: {
    backgroundColor: colors.primary[400],
  },
  themeChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.gray[700],
  },
  themeChipTextActive: {
    color: colors.base[0],
  },
});
