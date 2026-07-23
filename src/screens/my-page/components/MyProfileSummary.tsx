import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, shadow, typography } from "src/design/theme";

type Props = {
  profile?: string | null;
  nickname?: string | null;
  name?: string | null;
  level: string;
  onPressProfile: () => void;
  onPressShop: () => void;
  onPressCoupons: () => void;
};

export function MyProfileSummary({ profile, nickname, name, level, onPressProfile, onPressShop, onPressCoupons }: Props) {
  const displayName = nickname || name || "게스트";

  return (
    <View style={styles.profileWrapper}>
      <Pressable style={styles.profileBox} onPress={onPressProfile}>
        <View style={styles.profileImageWrapper}>
          {profile ? (
            <Image source={{ uri: profile }} style={styles.profileImage} />
          ) : (
            <Text style={styles.avatarInitial}>{displayName.slice(0, 1)}</Text>
          )}
        </View>

        <View style={styles.nicknameWrapper}>
          <View style={styles.nicknameBox}>
            <Text style={styles.nickname} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>
          <Text style={styles.level}>LV. {level}</Text>
        </View>
      </Pressable>

      <View style={styles.hallabongWrapper}>
        <View style={styles.goToStoreBox}>
          <View style={styles.hallabongIcon}>
            <Text style={styles.hallabongIconText}>●</Text>
          </View>
          <Pressable style={styles.goToStore} onPress={onPressShop}>
            <View style={styles.storeTextBox}>
              <Text style={styles.storeTitle}>상점</Text>
              <Text style={styles.storeDesc}>한라봉으로 다양한 상품을 구매해요!</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        </View>
        <Pressable style={styles.giftButton} onPress={onPressCoupons}>
          <Text style={styles.giftButtonText}>내 상품권 확인하기</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  profileWrapper: { backgroundColor: colors.bg[0], padding: 20, gap: 20 },
  profileBox: { flexDirection: "row", alignItems: "center", gap: 30 },
  profileImageWrapper: { width: 100, height: 100, borderRadius: 50, borderWidth: 1, borderColor: colors.gray[300], backgroundColor: colors.gray[200], alignItems: "center", justifyContent: "center", overflow: "hidden" },
  profileImage: { width: "100%", height: "100%" },
  avatarInitial: { ...typography.head1, color: colors.gray[500] },
  nicknameWrapper: { flex: 1, paddingTop: 20, paddingBottom: 18 },
  nicknameBox: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 12 },
  nickname: { width: 140, ...typography.head3, color: colors.gray[800] },
  level: { ...typography.body4, color: colors.gray[600] },
  hallabongWrapper: { paddingVertical: 18, paddingHorizontal: 16, borderRadius: 12, backgroundColor: colors.bg[0], ...shadow.card },
  goToStoreBox: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 20 },
  hallabongIcon: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary[100] },
  hallabongIconText: { color: colors.primary[400], fontSize: 20 },
  goToStore: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  storeTextBox: { flex: 1 },
  storeTitle: { ...typography.head4, color: colors.gray[700], fontWeight: "600", marginBottom: 4 },
  storeDesc: { ...typography.body4, color: colors.gray[600] },
  giftButton: { width: "100%", padding: 10, borderRadius: 8, backgroundColor: colors.primary[100], alignItems: "center" },
  giftButtonText: { ...typography.body3, color: colors.primary[500] },
  chevron: { fontSize: 26, lineHeight: 26, color: colors.gray[400] },
});
