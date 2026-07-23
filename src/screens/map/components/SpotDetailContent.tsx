import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import type { PostDetailProps } from "src/components/community/PostDetail/types";
import { colors, typography } from "src/design/theme";
import { formatDate } from "src/utils/formDate";

type Props = {
  spot: PostDetailProps;
};

export function SpotDetailContent({ spot }: Props) {
  return (
    <>
      <Text style={styles.title}>{spot.name}</Text>
      {spot.imageUrls?.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sliderWrapper}>
          {spot.imageUrls.map((image, index) => (
            <Image key={`${image}-${index}`} source={{ uri: image }} style={styles.slideImage} />
          ))}
        </ScrollView>
      ) : (
        <View style={[styles.slideImage, styles.heroFallback]}>
          <Text style={styles.heroFallbackText}>SPOT</Text>
        </View>
      )}

      <View style={styles.postWrapper}>
        <Text style={styles.meta}>
          {spot.userNickname || "제주데이"} · {formatDate(spot.createdAt)}
        </Text>
        <View style={styles.locationTag}>
          <Text style={styles.locationIcon}>⌖</Text>
          <Text style={styles.locationText} numberOfLines={1}>
            {spot.name}
          </Text>
        </View>
        <Text style={styles.description}>{spot.description || "이 스팟에 대한 소개가 아직 준비되지 않았어요."}</Text>
        <View style={styles.statsRow}>
          <Text style={styles.statText}>좋아요 {spot.likeCount ?? 0}</Text>
          <Text style={styles.statText}>
            {Number(spot.latitude).toFixed(3)}, {Number(spot.longitude).toFixed(3)}
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.head2,
    color: colors.gray[800],
    paddingLeft: 20,
    paddingTop: 10,
  },
  sliderWrapper: {
    gap: 10,
    paddingVertical: 20,
    paddingLeft: 20,
    paddingRight: 20,
  },
  slideImage: {
    width: 260,
    height: 260,
    borderRadius: 8,
    backgroundColor: colors.gray[300],
  },
  heroFallback: {
    marginTop: 20,
    marginLeft: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[50],
  },
  heroFallbackText: {
    ...typography.head2,
    color: colors.primary[400],
  },
  postWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
  },
  meta: {
    ...typography.caption2,
    color: colors.gray[400],
  },
  locationTag: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    maxWidth: "100%",
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 7,
    borderRadius: 50,
    backgroundColor: colors.gray[100],
  },
  locationIcon: {
    ...typography.caption1,
    color: colors.gray[400],
  },
  locationText: {
    ...typography.caption1,
    color: colors.gray[500],
  },
  description: {
    ...typography.body4,
    color: colors.gray[700],
    paddingVertical: 10,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statText: {
    ...typography.caption1,
    color: colors.gray[500],
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 100,
    backgroundColor: colors.gray[100],
  },
});
