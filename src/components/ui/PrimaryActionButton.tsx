import { ActivityIndicator, Pressable, Text } from "react-native";
import type { PressableProps, StyleProp, ViewStyle } from "react-native";
import { commonStyles } from "src/design/commonStyles";
import { colors } from "src/design/theme";

type Props = {
  label: string;
  loadingLabel?: string;
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  onPress: PressableProps["onPress"];
};

export function PrimaryActionButton({
  label,
  loadingLabel,
  isLoading = false,
  disabled = false,
  style,
  pressedStyle,
  onPress,
}: Props) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      style={({ pressed }) => [
        commonStyles.primaryButton,
        style,
        pressed && (pressedStyle ?? commonStyles.primaryButtonPressed),
        isDisabled && commonStyles.primaryButtonDisabled,
      ]}
      disabled={isDisabled}
      onPress={onPress}
    >
      {isLoading ? <ActivityIndicator color={colors.base[0]} /> : null}
      <Text style={commonStyles.primaryButtonText}>{isLoading ? loadingLabel ?? label : label}</Text>
    </Pressable>
  );
}
