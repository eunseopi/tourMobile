import { useEffect, useRef } from "react";
import type { PropsWithChildren } from "react";
import { Animated, type StyleProp, type ViewStyle } from "react-native";

type Props = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  distance?: number;
  duration?: number;
  delay?: number;
}>;

// 마커 상세 카드처럼 짧게 나타났다 사라지는 요소나, 리스트 아이템의 순차 등장(stagger)에 붙인다.
export function FadeSlideIn({ children, style, distance = 12, duration = 220, delay = 0 }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);
    const animation = Animated.spring(progress, {
      toValue: 1,
      delay,
      useNativeDriver: true,
      speed: 18,
      bounciness: 6,
    });
    animation.start();
    return () => animation.stop();
  }, [duration, delay, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [distance, 0],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
