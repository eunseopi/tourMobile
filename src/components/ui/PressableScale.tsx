import { useRef } from "react";
import type { PropsWithChildren } from "react";
import * as Haptics from "expo-haptics";
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = PropsWithChildren<Omit<PressableProps, "style">> & {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  haptic?: boolean;
};

// 앱 전체 버튼에 재사용하는 눌림 반응 + 가벼운 햅틱 피드백 wrapper.
// Pressable 자체를 애니메이션시켜서(감싸는 View 없음) 배경색 등 원래 스타일이 그대로 적용된다.
export function PressableScale({
  children,
  style,
  scaleTo = 0.94,
  haptic = true,
  onPressIn,
  onPressOut,
  onPress,
  disabled,
  ...rest
}: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (value: number) => {
    Animated.spring(scale, {
      toValue: value,
      useNativeDriver: true,
      speed: 30,
      bounciness: value === 1 ? 10 : 0,
    }).start();
  };

  return (
    <AnimatedPressable
      style={[style, { transform: [{ scale }] }, disabled ? { opacity: 0.6 } : null]}
      disabled={disabled}
      onPressIn={(e) => {
        if (!disabled) animateTo(scaleTo);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (!disabled) animateTo(1);
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.(e);
      }}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
