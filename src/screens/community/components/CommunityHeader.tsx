import { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import CloseIcon from "src/assets/Clear.svg";
import { colors, typography } from "src/design/theme";

export type CommunityTab = "latest" | "popular";

export type CommunityBanner = {
  id: string | number;
  imageUrl?: string | null;
  title?: string | null;
};

const TAB_ITEMS: Array<{ key: CommunityTab; label: string }> = [
  { key: "latest", label: "최신순" },
  { key: "popular", label: "좋아요순" },
];

type Props = {
  activeTab: CommunityTab;
  banners: CommunityBanner[];
  onChangeTab: (tab: CommunityTab) => void;
};

function BannerSlider({ items }: { items: CommunityBanner[] }) {
  const [current, setCurrent] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [width, setWidth] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    if (items.length <= 1 || isZoomed || isDragging.current || width === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => {
        const next = prev === items.length - 1 ? 0 : prev + 1;
        scrollRef.current?.scrollTo({ x: next * width, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length, isZoomed, width]);

  useEffect(() => {
    if (current > items.length - 1) setCurrent(0);
  }, [items.length, current]);

  const handleLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  // 사용자가 직접 좌우로 스와이프해서 넘긴 경우, 자동 재생 인덱스도 그 위치로 맞춘다.
  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    isDragging.current = false;
    if (width === 0) return;
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrent(Math.max(0, Math.min(index, items.length - 1)));
  };

  if (!items.length) return null;

  const activeBanner = items[current];

  return (
    <>
      <View style={styles.bannerWrapper} onLayout={handleLayout}>
        {width > 0 ? (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScrollBeginDrag={() => {
              isDragging.current = true;
            }}
            onMomentumScrollEnd={handleMomentumScrollEnd}
          >
            {items.map((banner) => (
              <Pressable
                key={String(banner.id)}
                style={[styles.bannerImage, { width }]}
                onPress={() => setIsZoomed(true)}
              >
                <Image
                  source={{ uri: banner.imageUrl ?? undefined }}
                  style={StyleSheet.absoluteFillObject}
                  contentFit="cover"
                  blurRadius={30}
                  cachePolicy="memory-disk"
                />
                <Image
                  source={{ uri: banner.imageUrl ?? undefined }}
                  style={StyleSheet.absoluteFillObject}
                  contentFit="contain"
                  cachePolicy="memory-disk"
                  transition={150}
                />
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
        <View style={styles.bannerCounter}>
          <Text style={styles.bannerCounterText}>
            {current + 1} / {items.length}
          </Text>
        </View>
      </View>

      <Modal visible={isZoomed} transparent animationType="fade" onRequestClose={() => setIsZoomed(false)}>
        <Pressable style={styles.zoomOverlay} onPress={() => setIsZoomed(false)}>
          <Pressable style={styles.zoomCloseButton} onPress={() => setIsZoomed(false)} hitSlop={12}>
            <CloseIcon width={22} height={22} />
          </Pressable>
          <Image
            source={{ uri: activeBanner?.imageUrl ?? undefined }}
            style={styles.zoomImage}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
          {activeBanner?.title ? (
            <Text style={styles.zoomTitle} numberOfLines={2}>
              {activeBanner.title}
            </Text>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

export function CommunityHeader({ activeTab, banners, onChangeTab }: Props) {
  return (
    <View>
      <View style={styles.titleSection}>
        <Text style={styles.subTitle}>현재 제주는?</Text>
        <Text style={styles.subtitle}>제주의 지역 축제를 알아보세요!</Text>
      </View>

      <BannerSlider items={banners} />

      <View style={styles.tabs}>
        {TAB_ITEMS.map((item) => {
          const active = item.key === activeTab;
          return (
            <Pressable
              key={item.key}
              style={[styles.tab, active && styles.activeTab]}
              onPress={() => onChangeTab(item.key)}
            >
              <Text style={[styles.tabText, active && styles.activeTabText]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleSection: {
    gap: 3,
    marginTop: 8,
    marginBottom: 19,
  },
  subTitle: {
    ...typography.head3,
    color: colors.gray[800],
  },
  subtitle: {
    ...typography.body3,
    color: colors.gray[600],
  },
  bannerWrapper: {
    position: "relative",
    width: "100%",
    height: 136,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.gray[100],
  },
  bannerImage: {
    height: "100%",
  },
  bannerCounter: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: colors.gray[500],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  bannerCounterText: {
    ...typography.caption2,
    fontSize: 12,
    color: colors.base[0],
  },
  zoomOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.92)",
    paddingHorizontal: 20,
  },
  zoomCloseButton: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 1,
  },
  zoomImage: {
    width: "100%",
    height: "70%",
  },
  zoomTitle: {
    ...typography.body3,
    color: colors.base[0],
    textAlign: "center",
    marginTop: 16,
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.bg[0],
  },
  tab: {
    flex: 1,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  activeTab: {
    borderBottomWidth: 1.5,
    borderBottomColor: colors.primary[400],
  },
  tabText: {
    ...typography.body1,
    fontWeight: "400",
    color: colors.gray[600],
  },
  activeTabText: {
    fontWeight: "600",
    color: colors.primary[400],
  },
});
