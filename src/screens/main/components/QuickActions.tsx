import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";

type Action = { label: string; onPress: () => void };

type Props = { actions: Action[] };

export function QuickActions({ actions }: Props) {
  return (
    <View style={styles.quickRow}>
      {actions.map((action) => (
        <Pressable key={action.label} style={styles.quickButton} onPress={action.onPress}>
          <Text style={styles.quickButtonText}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  quickButton: {
    minWidth: "48%",
    flexGrow: 1,
    minHeight: 48,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.bg[0],
  },
  quickButtonText: { ...typography.body1, color: colors.gray[700] },
});
