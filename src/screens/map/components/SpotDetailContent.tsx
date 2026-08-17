import { useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import type { PostDetailProps } from "src/components/community/PostDetail/types";
import { ImageViewerModal } from "src/components/ui/ImageViewerModal";
import LocationIcon from "src/assets/Location.svg";
import SpotMarker from "src/assets/spot.svg";
import { colors, typography } from "src/design/theme";
import { UserLocationMarker } from "src/screens/map/components/UserLocationMarker";
import { formatDate } from "src/utils/formDate";

type Props = {
  spot: PostDetailProps;
  myLocation?: { latitude: number; longitude: number } | null;
};

// 내 위치가 멀리 있으면(예: 서울) 목적지가 지도에서 너무 작게 보이므로,
// 길찾기는 버튼으로 대신하고 미니맵은 항상 목적지 기준으로 확대해서 보여준다.
function miniMapRegion(spot: PostDetailProps) {
  return {
    latitude: Number(spot.latitude),
    longitude: Number(spot.longitude),
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };
}

export function SpotDetailContent({ spot, myLocation }: Props) {
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);

  return (
    <>
      <Text style={styles.title}>{spot.name}</Text>
      {spot.imageUrls?.length ? (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sliderWrapper}>
            {spot.imageUrls.map((image, index) => (
              <Pressable
                key={`${image}-${index}`}
                onPress={() => {
                  setViewerIndex(index);
                  setViewerOpen(true);
                }}
              >
                <Image source={{ uri: image }} style={styles.slideImage} />
              </Pressable>
            ))}
          </ScrollView>
          <ImageViewerModal
            visible={viewerOpen}
            images={spot.imageUrls}
            initialIndex={viewerIndex}
            onClose={() => setViewerOpen(false)}
          />
        </>
      ) : (
        <View style={[styles.slideImage, styles.heroFallback]}>
          <SpotMarker width={56} height={57} />
        </View>
      )}

      <View style={styles.postWrapper}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            {spot.userProfile ? (
              <Image source={{ uri: spot.userProfile }} style={styles.avatarImage} />
            ) : null}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{spot.userNickname || "제주데이"}</Text>
            <Text style={styles.date}>{formatDate(spot.createdAt)}</Text>
          </View>
        </View>

        <Text style={styles.description}>{spot.description || "이 스팟에 대한 소개가 아직 준비되지 않았어요."}</Text>

        <View style={styles.locationTag}>
          <LocationIcon width={14} height={14} />
          <Text style={styles.locationText} numberOfLines={1}>
            {spot.name}
          </Text>
        </View>

        <View style={styles.miniMapWrap} pointerEvents="none">
          <MapView
            style={styles.miniMap}
            region={miniMapRegion(spot)}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            <Marker coordinate={{ latitude: Number(spot.latitude), longitude: Number(spot.longitude) }}>
              <SpotMarker width={30} height={31} />
            </Marker>
            {myLocation ? (
              <UserLocationMarker latitude={myLocation.latitude} longitude={myLocation.longitude} />
            ) : null}
          </MapView>
        </View>

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
    fontSize: 20,
    fontWeight: "700",
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
  postWrapper: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingVertical: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: colors.gray[100],
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  profileInfo: {
    justifyContent: "center",
    gap: 2,
  },
  username: {
    ...typography.body1,
    color: colors.gray[800],
  },
  date: {
    ...typography.caption2,
    color: colors.gray[600],
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
  locationText: {
    ...typography.caption1,
    color: colors.gray[600],
  },
  miniMapWrap: {
    height: 140,
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.gray[100],
  },
  miniMap: {
    ...StyleSheet.absoluteFillObject,
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
    color: colors.gray[600],
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 100,
    backgroundColor: colors.gray[100],
  },
});
