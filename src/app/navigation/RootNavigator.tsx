import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "src/screens/auth/SplashScreen";
import PermissionScreen from "src/screens/auth/PermissionScreen";
import RegisterChoiceScreen from "src/screens/auth/RegisterChoiceScreen";
import LoginScreen from "src/screens/auth/LoginScreen";
import RegisterScreen from "src/screens/auth/RegisterScreen";
import PasswordResetScreen from "src/screens/auth/PasswordResetScreen";
import { MainTabNavigator } from "./MainTabNavigator";
import MapScreen from "src/screens/map/MapScreen";
import SpotDetailScreen from "src/screens/map/SpotDetailScreen";
import PostDetailScreen from "src/screens/community/PostDetailScreen";
import PostWriteScreen from "src/screens/community/PostWriteScreen";
import PostEditScreen from "src/screens/community/PostEditScreen";
import CommunitySearchScreen from "src/screens/community/CommunitySearchScreen";
import ChallengeDetailScreen from "src/screens/challenge/ChallengeDetailScreen";
import ChallengeCompleteScreen from "src/screens/challenge/ChallengeCompleteScreen";
import ProductDetailScreen from "src/screens/shop/ProductDetailScreen";
import PointConvertScreen from "src/screens/shop/PointConvertScreen";
import MyCouponsScreen from "src/screens/my-page/MyCouponsScreen";
import CouponDetailScreen from "src/screens/my-page/CouponDetailScreen";
import ProfileEditScreen from "src/screens/my-page/ProfileEditScreen";
import ThemeEditScreen from "src/screens/my-page/ThemeEditScreen";
import AboutScreen from "src/screens/my-page/AboutScreen";
import ContactScreen from "src/screens/my-page/ContactScreen";
import TermsScreen from "src/screens/my-page/TermsScreen";
import PrivacyPolicyScreen from "src/screens/my-page/PrivacyPolicyScreen";
import NotificationScreen from "src/screens/notifications/NotificationScreen";
import MyActivityScreen from "src/screens/my-page/MyActivityScreen";
import BlockedUsersScreen from "src/screens/my-page/BlockedUsersScreen";
import MissionListScreen from "src/screens/missions/MissionListScreen";
import MissionDetailScreen from "src/screens/missions/MissionDetailScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Permission" component={PermissionScreen} />
      <Stack.Screen name="RegisterChoice" component={RegisterChoiceScreen} />
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="MyCoupons" component={MyCouponsScreen} />
      <Stack.Screen name="PointConvert" component={PointConvertScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="ThemeEdit" component={ThemeEditScreen} />
      <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="MyActivity" component={MyActivityScreen} />
      <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
      <Stack.Screen name="MissionList" component={MissionListScreen} />
      <Stack.Screen name="MissionDetail" component={MissionDetailScreen} />
      <Stack.Screen name="CouponDetail" component={CouponDetailScreen} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
      <Stack.Screen name="ChallengeComplete" component={ChallengeCompleteScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="SpotDetail" component={SpotDetailScreen} />
      <Stack.Screen name="PostWrite" component={PostWriteScreen} />
      <Stack.Screen name="PostEdit" component={PostEditScreen} />
      <Stack.Screen name="CommunitySearch" component={CommunitySearchScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
