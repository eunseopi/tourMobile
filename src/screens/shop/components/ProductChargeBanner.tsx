import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";

type Props = {
  onPress: () => void;
};

export function ProductChargeBanner({ onPress }: Props) {
  return (
    <Pressable style={styles.banner} onPress={onPress}>
      <View style={styles.bannerImage} />
      <View style={styles.bannerTextBox}>
        <Text style={styles.bannerTitle}>한라봉 충전하기</Text>
        <Text style={styles.bannerSubtitle}>포인트를 한라봉으로 바꿔보세요.</Text>
      </View>
      <Text style={styles.bannerArrow}>›</Text>
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
  bannerImage: {
    width: 104,
    height: "100%",
    backgroundColor: colors.primary[100],
  },
  bannerTextBox: {
    flex: 1,
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
    paddingRight: 20,
    fontSize: 24,
    color: colors.primary[400],
  },
});
