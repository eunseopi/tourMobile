import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * react-navigation의 useBottomTabBarHeight()가 커스텀 tabBarStyle(높이를 함수로
 * 동적으로 주는 방식)에서 실측 전 잠깐 기본값을 반환하는 경우가 있어, 화면 쪽 콘텐츠
 * paddingBottom이 실제 탭바 높이와 안 맞고 여백이 남는 문제가 있었다. MainTabNavigator의
 * tabBarStyle 계산식(52 + bottomInset)을 그대로 재사용해 항상 정확한 값을 쓴다.
 */
export function useTabBarHeight() {
  const insets = useSafeAreaInsets();
  return 52 + Math.max(insets.bottom, 8) + 8;
}
