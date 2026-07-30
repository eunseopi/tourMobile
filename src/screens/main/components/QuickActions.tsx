import type { ComponentType } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, layout, typography } from "src/design/theme";
import MapIcon from "src/assets/spot.svg";
import ShopIcon from "src/assets/store.svg";
import CommunityIcon from "src/assets/Social.svg";
import ChallengeIcon from "src/assets/Challenge_ic.svg";
import MyPageIcon from "src/assets/MyPage.svg";

type Action = { label: string; onPress: () => void };

type Props = { actions: Action[] };

type IconComponent = ComponentType<{ width?: number; height?: number }>;

const ICONS: Record<string, IconComponent> = {
  지도: MapIcon,
  상점: ShopIcon,
  주간제주: CommunityIcon,
  챌린지: ChallengeIcon,
  마이페이지: MyPageIcon,
};

export function QuickActions({ actions }: Props) {
  return (
    <View style={styles.quickRow}>
      {actions.map((action) => {
        const Icon = ICONS[action.label];
        return (
          <Pressable key={action.label} style={styles.quickButton} onPress={action.onPress}>
            {Icon ? (
              <View style={styles.quickIcon}>
                <Icon width={20} height={20} />
              </View>
            ) : null}
            <Text style={styles.quickButtonText}>{action.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 16 },
  quickButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    minWidth: "48%",
    flexGrow: 1,
    minHeight: layout.buttonHeight,
    borderRadius: layout.buttonRadius,
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.bg[0],
  },
  quickIcon: { width: 20, height: 20, alignItems: "center", justifyContent: "center" },
  quickButtonText: { ...typography.body1, color: colors.gray[700] },
});
