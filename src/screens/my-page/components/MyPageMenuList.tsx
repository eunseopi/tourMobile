import type { ReactNode } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { PressableScale } from "src/components/ui/PressableScale";
import ActivityIcon from "src/assets/Activity.svg";
import DocumentIcon from "src/assets/Document.svg";
import InfoIcon from "src/assets/Info.svg";
import LockIcon from "src/assets/Lock.svg";
import NotiIcon from "src/assets/Noti.svg";
import SettingIcon from "src/assets/Setting.svg";
import ShieldIcon from "src/assets/Shield.svg";
import ThemeSettingsIcon from "src/assets/ThemeSettings.svg";
import { colors, shadow, typography } from "src/design/theme";

type Props = {
  notiEnabled: boolean;
  onToggleNoti: (enabled: boolean) => void;
  onPressTheme: () => void;
  onPressPassword: () => void;
  onPressActivity: () => void;
  onPressBlockedUsers: () => void;
  onPressContact: () => void;
  onPressAbout: () => void;
  onPressTerms: () => void;
  onPressPrivacy: () => void;
};

export function MyPageMenuList({
  notiEnabled,
  onToggleNoti,
  onPressTheme,
  onPressPassword,
  onPressActivity,
  onPressBlockedUsers,
  onPressContact,
  onPressAbout,
  onPressTerms,
  onPressPrivacy,
}: Props) {
  return (
    <View style={styles.menuWrapper}>
      <View style={styles.menuRow}>
        <View style={styles.menuBox}>
          <NotiIcon width={24} height={24} />
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
      <MenuItem icon={<ActivityIcon width={24} height={24} />} label="내 활동" onPress={onPressActivity} />
      <MenuItem icon={<ThemeSettingsIcon width={24} height={24} />} label="테마 수정" onPress={onPressTheme} />
      <MenuItem icon={<LockIcon width={24} height={24} />} label="비밀번호 수정" onPress={onPressPassword} />
      <MenuItem icon={<ShieldIcon width={24} height={24} />} label="차단 관리" onPress={onPressBlockedUsers} />
      <MenuItem icon={<SettingIcon width={24} height={24} />} label="문의하기" onPress={onPressContact} />
      <MenuItem icon={<InfoIcon width={24} height={24} />} label="서비스 소개" onPress={onPressAbout} />
      <MenuItem icon={<DocumentIcon width={24} height={24} />} label="이용약관" onPress={onPressTerms} />
      <MenuItem icon={<ShieldIcon width={24} height={24} />} label="개인정보 처리방침" onPress={onPressPrivacy} />
    </View>
  );
}

function MenuItem({ icon, label, onPress }: { icon: ReactNode; label: string; onPress?: () => void }) {
  return (
    <PressableScale style={styles.menuRow} scaleTo={0.98} onPress={onPress}>
      <View style={styles.menuBox}>
        <View style={styles.menuIcon}>{icon}</View>
        <Text style={styles.menuText}>{label}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  menuWrapper: { marginTop: 10, marginBottom: 30, borderRadius: 12, overflow: "hidden", ...shadow.card },
  menuRow: { minHeight: 66, paddingVertical: 20.5, paddingHorizontal: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: colors.gray[300], backgroundColor: colors.bg[0] },
  menuBox: { flexDirection: "row", alignItems: "center", gap: 8 },
  menuIcon: { width: 26, alignItems: "center", justifyContent: "center" },
  menuText: { ...typography.body1, color: colors.gray[700] },
  chevron: { fontSize: 26, lineHeight: 26, color: colors.gray[600] },
});
