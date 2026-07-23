import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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

export function CommunityHeader({ activeTab, banners, onChangeTab }: Props) {
  return (
    <View>
      <Text style={styles.title}>커뮤니티</Text>

      {banners.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.bannerList}
        >
          {banners.map((banner) => (
            <View key={String(banner.id)} style={styles.bannerCard}>
              {banner.imageUrl ? (
                <Image source={{ uri: banner.imageUrl }} style={styles.bannerImage} />
              ) : null}
              {banner.title ? (
                <Text style={styles.bannerTitle} numberOfLines={1}>
                  {banner.title}
                </Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
      ) : null}

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
  title: {
    ...typography.head2,
    color: colors.gray[800],
    marginBottom: 4,
  },
  bannerList: {
    gap: 12,
    paddingVertical: 16,
  },
  bannerCard: {
    width: 280,
    height: 112,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.primary[50],
  },
  bannerImage: {
    width: "100%",
    height: "100%",
  },
  bannerTitle: {
    position: "absolute",
    left: 14,
    right: 14,
    bottom: 12,
    ...typography.body1,
    color: colors.base[0],
  },
  tabs: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
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
