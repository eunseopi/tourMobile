import { Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { colors, shadow, typography } from "src/design/theme";

type Props = {
  notiEnabled: boolean;
  onToggleNoti: (enabled: boolean) => void;
  onPressCommunity: () => void;
  onPressChallenge: () => void;
  onPressProfile: () => void;
  onPressTheme: () => void;
  onPressPassword: () => void;
};

export function MyPageMenuList({
  notiEnabled,
  onToggleNoti,
  onPressCommunity,
  onPressChallenge,
  onPressProfile,
  onPressTheme,
  onPressPassword,
}: Props) {
  return (
    <View style={styles.menuWrapper}>
      <MenuItem icon="◎" label="커뮤니티 보러가기" onPress={onPressCommunity} />
      <MenuItem icon="◇" label="챌린지 보러가기" onPress={onPressChallenge} />
      <View style={styles.menuRow}>
        <View style={styles.menuBox}>
          <Text style={styles.menuIcon}>◉</Text>
          <Text style={styles.menuText}>알림설정</Text>
        </View>
        <Switch
          value={notiEnabled}
          onValueChange={onToggleNoti}
          trackColor={{ false: colors.gray[400], true: colors.primary[400] }}
          thumbColor={colors.base[0]}
          ios_backgroundColor={colors.gray[400]}
        />
      </View>
      <MenuItem icon="⚙" label="프로필 수정" onPress={onPressProfile} />
      <MenuItem icon="⚙" label="테마 수정" onPress={onPressTheme} />
      <MenuItem icon="⚙" label="비밀번호 수정" onPress={onPressPassword} />
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: string; label: string; onPress?: () => void }) {
  return (
    <Pressable style={styles.menuRow} onPress={onPress}>
      <View style={styles.menuBox}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <Text style={styles.menuText}>{label}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuWrapper: { marginTop: 10, marginBottom: 30, borderRadius: 12, overflow: "hidden", ...shadow.card },
  menuRow: { minHeight: 66, paddingVertical: 20.5, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.gray[300], backgroundColor: colors.bg[0] },
  menuBox: { flexDirection: "row", alignItems: "center", gap: 8 },
  menuIcon: { width: 26, textAlign: "center", fontSize: 20, color: colors.gray[500] },
  menuText: { ...typography.body1, color: colors.gray[700] },
  chevron: { fontSize: 26, lineHeight: 26, color: colors.gray[400] },
});
