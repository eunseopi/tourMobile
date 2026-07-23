import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";

export type ChallengeTab = "pre" | "doing" | "done";

export const CHALLENGE_TABS: Array<{ key: ChallengeTab; label: string }> = [
  { key: "pre", label: "진행전" },
  { key: "doing", label: "진행중" },
  { key: "done", label: "완료" },
];

type Props = {
  value: ChallengeTab;
  onChange: (tab: ChallengeTab) => void;
};

export function ChallengeTabs({ value, onChange }: Props) {
  const activeIndex = CHALLENGE_TABS.findIndex((item) => item.key === value);

  return (
    <View style={styles.tabs}>
      {CHALLENGE_TABS.map((item) => {
        const active = item.key === value;
        return (
          <Pressable key={item.key} style={styles.tab} onPress={() => onChange(item.key)}>
            <Text style={[styles.tabText, active && styles.activeTabText]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
      <View style={[styles.indicator, { left: `${activeIndex * 33.3333}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: {
    position: "relative",
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  tab: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  tabText: {
    ...typography.body1,
    color: colors.gray[500],
    fontWeight: "400",
  },
  activeTabText: {
    color: colors.primary[400],
    fontWeight: "600",
  },
  indicator: {
    position: "absolute",
    bottom: 0,
    width: "33.3333%",
    height: 3,
    backgroundColor: colors.primary[400],
  },
});
