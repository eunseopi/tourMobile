import { ActivityIndicator, Pressable, Text } from "react-native";
import { commonStyles } from "src/design/commonStyles";
import { colors } from "src/design/theme";

type Props = {
  isSaving: boolean;
  disabled: boolean;
  onSave: () => void;
};

export function ProfileEditSubmitBar({ isSaving, disabled, onSave }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        commonStyles.primaryButton,
        pressed && commonStyles.primaryButtonPressed,
        disabled && commonStyles.primaryButtonDisabled,
      ]}
      disabled={disabled}
      onPress={onSave}
    >
      {isSaving ? (
        <ActivityIndicator color={colors.base[0]} />
      ) : (
        <Text style={commonStyles.primaryButtonText}>수정하기</Text>
      )}
    </Pressable>
  );
}
