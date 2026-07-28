import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Pressable, StyleSheet, Text } from "react-native";
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
import { colors, typography } from "src/design/theme";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={({ navigation }) => ({
        headerBackVisible: false,
        headerTintColor: colors.gray[800],
        headerLeft: ({ canGoBack }) =>
          canGoBack ? (
            <Pressable
              accessibilityLabel="뒤로가기"
              hitSlop={12}
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>{"<"}</Text>
            </Pressable>
          ) : null,
      })}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Permission" component={PermissionScreen} options={{ title: "권한 안내" }} />
      <Stack.Screen name="LanguageSetting" component={LanguageSettingScreen} options={{ title: "언어 설정" }} />
      <Stack.Screen name="RegisterChoice" component={RegisterChoiceScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Main" component={MainScreen} options={{ title: "제주데이", headerLeft: () => null }} />
      <Stack.Screen name="Map" component={MapScreen} options={{ title: "지도 탐색" }} />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Shop" component={ShopScreen} options={{ title: "구매하기" }} />
      <Stack.Screen name="MyPage" component={MyPageScreen} options={{ title: "마이페이지" }} />
      <Stack.Screen name="MyCoupons" component={MyCouponsScreen} options={{ title: "내 상품권" }} />
      <Stack.Screen name="PointConvert" component={PointConvertScreen} options={{ title: "포인트 전환" }} />
      <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} options={{ title: "프로필 수정" }} />
      <Stack.Screen name="ThemeEdit" component={ThemeEditScreen} options={{ title: "테마 수정하기" }} />
      <Stack.Screen name="PasswordReset" component={PasswordResetScreen} options={{ title: "비밀번호 수정하기" }} />
      <Stack.Screen name="CouponDetail" component={CouponDetailScreen} options={{ title: "사용하기" }} />
      <Stack.Screen name="Community" component={CommunityScreen} options={{ title: "커뮤니티" }} />
      <Stack.Screen name="Challenge" component={ChallengeScreen} options={{ title: "챌린지" }} />
      <Stack.Screen name="ChallengeDetail" component={ChallengeDetailScreen} options={{ title: "진행 전" }} />
      <Stack.Screen name="ChallengeComplete" component={ChallengeCompleteScreen} options={{ title: "챌린지 인증" }} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: "게시글" }} />
      <Stack.Screen name="SpotDetail" component={SpotDetailScreen} options={{ title: "스팟 상세" }} />
      <Stack.Screen name="PostWrite" component={PostWriteScreen} options={{ title: "스팟추가" }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: "상품소개" }} />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  backButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
  },
  backButtonText: {
    ...typography.head3,
    color: colors.gray[800],
  },
});
