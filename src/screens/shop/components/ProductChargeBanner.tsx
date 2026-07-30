import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";
import HanlabongBannerImage from "src/assets/hanlabong_banner.svg";

type Props = {
  onPress: () => void;
};

export function ProductChargeBanner({ onPress }: Props) {
  return (
    <Pressable style={styles.banner} onPress={onPress}>
      <HanlabongBannerImage width={121} height={91} />
      <View style={styles.bannerTextBox}>
        <View style={styles.bannerTitleRow}>
          <Text style={styles.bannerTitle}>한라봉이 부족하다면?</Text>
          <Text style={styles.bannerArrow}>›</Text>
        </View>
        <Text style={styles.bannerSubtitle}>한라봉 받으러 가기</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 91,
    marginTop: 40,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFF4DB",
  },
  bannerTextBox: {
    flex: 1,
    paddingRight: 20,
  },
  bannerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerTitle: {
    ...typography.head4,
    color: colors.primary[500],
    fontWeight: "600",
  },
  bannerSubtitle: {
    ...typography.body4,
    color: colors.primary[400],
    marginTop: 4,
  },
  bannerArrow: {
    fontSize: 18,
    lineHeight: 22,
    color: colors.primary[500],
  },
});
