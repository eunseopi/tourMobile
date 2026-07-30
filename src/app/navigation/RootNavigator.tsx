import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SplashScreen from "src/screens/auth/SplashScreen";
import PermissionScreen from "src/screens/auth/PermissionScreen";
import LanguageSettingScreen from "src/screens/auth/LanguageSettingScreen";
import RegisterChoiceScreen from "src/screens/auth/RegisterChoiceScreen";
import LoginScreen from "src/screens/auth/LoginScreen";
import RegisterScreen from "src/screens/auth/RegisterScreen";
import PasswordResetScreen from "src/screens/auth/PasswordResetScreen";
import MainScreen from "src/screens/main/MainScreen";
import MapScreen from "src/screens/map/MapScreen";
import SpotDetailScreen from "src/screens/map/SpotDetailScreen";
import CommunityScreen from "src/screens/community/CommunityScreen";
import PostDetailScreen from "src/screens/community/PostDetailScreen";
import PostWriteScreen from "src/screens/community/PostWriteScreen";
import ChallengeScreen from "src/screens/challenge/ChallengeScreen";
import ChallengeDetailScreen from "src/screens/challenge/ChallengeDetailScreen";
import ChallengeCompleteScreen from "src/screens/challenge/ChallengeCompleteScreen";
import ShopScreen from "src/screens/shop/ShopScreen";
import ProductDetailScreen from "src/screens/shop/ProductDetailScreen";
import PointConvertScreen from "src/screens/shop/PointConvertScreen";
import MyPageScreen from "src/screens/my-page/MyPageScreen";
import MyCouponsScreen from "src/screens/my-page/MyCouponsScreen";
import CouponDetailScreen from "src/screens/my-page/CouponDetailScreen";
import ProfileEditScreen from "src/screens/my-page/ProfileEditScreen";
import ThemeEditScreen from "src/screens/my-page/ThemeEditScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Permission" component={PermissionScreen} />
      <Stack.Screen name="LanguageSetting" component={LanguageSettingScreen} />
      <Stack.Screen name="RegisterChoice" component={RegisterChoiceScreen} />
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="Map" component={MapScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="MyPage" component={MyPageScreen} />
      <Stack.Screen name="MyCoupons" component={MyCouponsScreen} />
      <Stack.Screen name="PointConvert" component={PointConvertScreen} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <Stack.Screen name="ThemeEdit" component={ThemeEditScreen} />
      <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
      <Stack.Screen name="CouponDetail" component={CouponDetailScreen} />
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="Challenge" component={ChallengeScreen} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} />
      <Stack.Screen name="ChallengeComplete" component={ChallengeCompleteScreen} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
      <Stack.Screen name="SpotDetail" component={SpotDetailScreen} />
      <Stack.Screen name="PostWrite" component={PostWriteScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
}
