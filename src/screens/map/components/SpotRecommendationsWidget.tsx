import { Image } from "expo-image";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import type { SpotRecommendation } from "src/api/spotsApi";
import { FadeSlideIn } from "src/components/ui/FadeSlideIn";
import { PressableScale } from "src/components/ui/PressableScale";
import { colors, typography } from "src/design/theme";
import { useNearbyRecommendations } from "src/features/spot/useNearbyRecommendations";
import { formatDistance } from "src/screens/map/mapUtils";

type Props = {
  spotId: number | string | undefined;
  onSelect: (item: SpotRecommendation) => void;
};

function getCongestionInfo(score: number | null) {
  if (score == null) return null;
  if (score < 0.34) return { label: "한산해요", color: "#1E9E5A", bg: "#E6F7EE" };
  if (score < 0.67) return { label: "보통이에요", color: "#C77700", bg: "#FFF3DF" };
  return { label: "혼잡해요", color: "#D63B3B", bg: "#FDEAEA" };
}

export function SpotRecommendationsWidget({ spotId, onSelect }: Props) {
  const { data, isLoading } = useNearbyRecommendations(spotId);

  if (isLoading) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>이런 곳도 있어요</Text>
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary[400]} />
        </View>
      </View>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>이런 곳도 있어요</Text>
      <Text style={styles.subtitle}>취향과 혼잡도를 반영해 골라봤어요</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {data.map((item, index) => {
          const congestion = getCongestionInfo(item.congestionScore);
          return (
            <FadeSlideIn key={`${item.type}-${item.id}`} delay={index * 40}>
              <PressableScale style={styles.card} onPress={() => onSelect(item)}>
                <View style={styles.imageWrap}>
                  {item.imageUrls?.[0] ? (
                    <Image
                      source={{ uri: item.imageUrls[0] }}
                      style={styles.image}
                      contentFit="cover"
                      cachePolicy="memory-disk"
                      transition={150}
                    />
                  ) : (
                    <View style={[styles.image, styles.imagePlaceholder]} />
                  )}
                  {congestion ? (
                    <View style={[styles.congestionBadge, { backgroundColor: congestion.bg }]}>
                      <Text style={[styles.congestionText, { color: congestion.color }]}>
                        {congestion.label}
                      </Text>
                    </View>
                  ) : null}
                  {item.type === "CHALLENGE" ? (
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>챌린지</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {formatDistance(item.distanceMeters / 1000)}
                </Text>
                {item.overviewSnippet ? (
                  <Text style={styles.cardSnippet} numberOfLines={2}>
                    {item.overviewSnippet}
                  </Text>
                ) : null}
              </PressableScale>
            </FadeSlideIn>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
    paddingTop: 10,
    paddingBottom: 2,
    backgroundColor: colors.bg[50],
  },
  title: {
    ...typography.head3,
    color: colors.gray[800],
    paddingHorizontal: 20,
  },
  subtitle: {
    ...typography.body4,
    color: colors.gray[600],
    paddingHorizontal: 20,
    marginTop: 2,
    marginBottom: 7,
  },
  loadingBox: {
    height: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    gap: 7,
    paddingHorizontal: 20,
  },
  card: {
    width: 200,
  },
  imageWrap: {
    width: 200,
    height: 150,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: colors.gray[100],
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    backgroundColor: colors.gray[200],
  },
  congestionBadge: {
    position: "absolute",
    left: 8,
    top: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
  },
  congestionText: {
    ...typography.caption2,
    fontSize: 11,
    fontWeight: "700",
  },
  typeBadge: {
    position: "absolute",
    right: 8,
    top: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  typeBadgeText: {
    ...typography.caption2,
    fontSize: 11,
    fontWeight: "700",
    color: colors.base[0],
  },
  cardTitle: {
    ...typography.body1,
    color: colors.gray[800],
    marginTop: 5,
  },
  cardMeta: {
    ...typography.caption1,
    color: colors.gray[600],
    marginTop: 1,
  },
  cardSnippet: {
    ...typography.caption2,
    color: colors.gray[600],
    marginTop: 2,
    lineHeight: 17,
  },
});
