import { Image, StyleSheet, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import type { OwnedProduct } from "src/api/product";
import { colors, shadow, typography } from "src/design/theme";

type Props = {
  coupon: OwnedProduct;
};

export function CouponDetailCard({ coupon }: Props) {
  const isTicon = coupon.category === "JEJU_TICON";

  return (
    <View style={styles.couponBox}>
      <View style={styles.productImageWrapper}>
        {coupon.imageUrl ? <Image source={{ uri: coupon.imageUrl }} style={styles.productImage} /> : null}
      </View>

      <View style={styles.couponInformation}>
        <Text style={styles.couponName} numberOfLines={2}>
          {coupon.name}
        </Text>
        <View style={styles.bar} />

        {isTicon ? (
          <>
            <View style={styles.qrArea}>
              {coupon.redeemCode ? (
                <>
                  <QRCode value={coupon.redeemCode} size={148} />
                  <Text style={styles.redeemCode}>{coupon.redeemCode}</Text>
                </>
              ) : (
                <Text style={styles.placeText}>코드를 불러오지 못했어요. 잠시 후 다시 시도해주세요.</Text>
              )}
            </View>

            <View style={styles.alertBox}>
              <Text style={styles.alertText}>
                제휴처 직원에게 이 QR 코드나 번호를 보여주고 할인받으세요.{`
`}
                1회만 사용 가능하고 재사용은 불가합니다.{`
`}
                ※ 사용 전 내용을 꼭 확인해 주세요. ※
              </Text>
            </View>
          </>
        ) : (
          <>
            <View style={styles.availablePlace}>
              <Text style={styles.placeCaption}>사용처</Text>
              <Text style={styles.placeText}>
                인천광역시 중구 공항로271, 인천국제공항 제 1 여객터미널 교통센터 지하 1층
              </Text>
            </View>

            <View style={styles.alertBox}>
              <Text style={styles.alertText}>
                해당 버튼은 담당자에게 물품 수령 시 제출하며{`
`}
                1회만 사용 가능하고 재사용은 불가합니다.{`
`}
                ※ 사용 전 내용을 꼭 확인해 주세요. ※
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  couponBox: {
    paddingVertical: 18,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  productImageWrapper: {
    width: "100%",
    aspectRatio: 32 / 27,
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.gray[200],
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  couponInformation: {
    marginVertical: 20,
  },
  couponName: {
    ...typography.head4,
    color: colors.gray[800],
    fontWeight: "600",
  },
  bar: {
    height: 1,
    marginVertical: 16,
    backgroundColor: colors.gray[200],
  },
  qrArea: {
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  redeemCode: {
    ...typography.body1,
    fontWeight: "700",
    letterSpacing: 2,
    color: colors.gray[800],
  },
  availablePlace: {
    marginBottom: 8,
  },
  placeCaption: {
    ...typography.body3,
    color: colors.gray[700],
    marginBottom: 4,
  },
  placeText: {
    ...typography.caption2,
    color: colors.gray[600],
  },
  alertBox: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.bg[50],
  },
  alertText: {
    ...typography.caption2,
    color: colors.gray[600],
    textAlign: "center",
  },
});
