import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { ComponentType } from "react";
import { StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import HomeIcon from "src/assets/home.svg";
import HomeActiveIcon from "src/assets/Home_active.svg";
import CommunityIcon from "src/assets/Social_gray.svg";
import CommunityActiveIcon from "src/assets/Social.svg";
import ChallengeIcon from "src/assets/Challenge_gray.svg";
import ChallengeActiveIcon from "src/assets/Challenge_ic.svg";
import MyPageIcon from "src/assets/MyPage.svg";
import MyPageActiveIcon from "src/assets/myPage_active.svg";
import ShopIcon from "src/assets/Store_gray.svg";
import ShopActiveIcon from "src/assets/store.svg";
import { colors, typography } from "src/design/theme";
import { useRegisterPushToken } from "src/features/notifications/useRegisterPushToken";
import { useStepTracking } from "src/features/steps/useStepTracking";
import MainScreen from "src/screens/main/MainScreen";
import CommunityScreen from "src/screens/community/CommunityScreen";
import ChallengeScreen from "src/screens/challenge/ChallengeScreen";
import ShopScreen from "src/screens/shop/ShopScreen";
import MyPageScreen from "src/screens/my-page/MyPageScreen";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

type SvgIcon = ComponentType<{ width?: number; height?: number }>;

const TAB_ICONS: Record<keyof MainTabParamList, { active: SvgIcon; inactive: SvgIcon }> = {
  Home: { active: HomeActiveIcon, inactive: HomeIcon },
  Community: { active: CommunityActiveIcon, inactive: CommunityIcon },
  Challenge: { active: ChallengeActiveIcon, inactive: ChallengeIcon },
  Shop: { active: ShopActiveIcon, inactive: ShopIcon },
  MyPage: { active: MyPageActiveIcon, inactive: MyPageIcon },
};

export function MainTabNavigator() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 8) + 8;
  useRegisterPushToken();
  useStepTracking();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary[400],
        tabBarInactiveTintColor: colors.gray[400],
        tabBarStyle: [styles.tabBar, { height: 52 + bottomInset, paddingBottom: bottomInset }],
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused }) => {
          const icons = TAB_ICONS[route.name as keyof MainTabParamList];
          const Icon = focused ? icons.active : icons.inactive;
          return <Icon width={24} height={24} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={MainScreen} options={{ tabBarLabel: "홈" }} />
      <Tab.Screen name="Challenge" component={ChallengeScreen} options={{ tabBarLabel: "챌린지" }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ tabBarLabel: "커뮤니티" }} />
      <Tab.Screen name="Shop" component={ShopScreen} options={{ tabBarLabel: "상점" }} />
      <Tab.Screen name="MyPage" component={MyPageScreen} options={{ tabBarLabel: "마이페이지" }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray[200],
    backgroundColor: colors.bg[0],
  },
  tabBarLabel: {
    ...typography.caption2,
    fontSize: 11,
  },
});
