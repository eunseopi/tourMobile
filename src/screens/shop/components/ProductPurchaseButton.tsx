import { ActivityIndicator, Pressable, Text } from "react-native";
import { commonStyles } from "src/design/commonStyles";
import { colors } from "src/design/theme";

type Props = {
  isPurchasing: boolean;
  onPurchase: () => void;
};

export function ProductPurchaseButton({ isPurchasing, onPurchase }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        commonStyles.primaryButton,
        pressed && commonStyles.primaryButtonPressed,
        isPurchasing && commonStyles.primaryButtonDisabled,
      ]}
      disabled={isPurchasing}
      onPress={onPurchase}
    >
      {isPurchasing ? (
        <ActivityIndicator color={colors.base[0]} />
      ) : (
        <Text style={commonStyles.primaryButtonText}>구매하기</Text>
      )}
    </Pressable>
  );
}
