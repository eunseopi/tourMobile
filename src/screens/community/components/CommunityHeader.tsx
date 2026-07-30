import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";

export type CommunityTab = "latest" | "popular";

export type CommunityBanner = {
  id: string | number;
  imageUrl?: string | null;
  title?: string | null;
};

const TAB_ITEMS: Array<{ key: CommunityTab; label: string }> = [
  { key: "latest", label: "최신순" },
  { key: "popular", label: "인기순" },
];

type Props = {
  activeTab: CommunityTab;
  banners: CommunityBanner[];
  onChangeTab: (tab: CommunityTab) => void;
};

function BannerSlider({ items }: { items: CommunityBanner[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === items.length - 1 ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [items.length]);

  useEffect(() => {
    if (current > items.length - 1) setCurrent(0);
  }, [items.length, current]);

  if (!items.length) return null;

  return (
    <View style={styles.bannerWrapper}>
      {items.map((banner, idx) => (
        <Image
          key={String(banner.id)}
          source={{ uri: banner.imageUrl ?? undefined }}
          style={[styles.bannerImage, { opacity: idx === current ? 1 : 0 }]}
        />
      ))}
      <View style={styles.bannerCounter}>
        <Text style={styles.bannerCounterText}>
          {current + 1} / {items.length}
        </Text>
      </View>
    </View>
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
    color: colors.gray[500],
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
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
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
    color: colors.gray[500],
  },
  activeTabText: {
    fontWeight: "600",
    color: colors.primary[400],
  },
});
