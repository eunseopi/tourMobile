import { Pressable, StyleSheet, Text, View } from "react-native";
import { FormTextField } from "src/components/form/FormTextField";
import { colors, typography } from "src/design/theme";

type Props = {
  nickname: string;
  error?: string;
  onChangeNickname: (value: string) => void;
  onValidateNickname: () => void;
};

export function ProfileNicknameForm({
  nickname,
  error,
  onChangeNickname,
  onValidateNickname,
}: Props) {
  return (
    <>
      <View style={styles.nicknameRow}>
        <FormTextField
          label="닉네임을 입력해주세요."
          value={nickname}
          onChangeText={onChangeNickname}
          placeholder="닉네임을 입력하세요"
          maxLength={20}
          error={error}
          containerStyle={styles.inputField}
        />
        <Pressable style={styles.checkButton} onPress={onValidateNickname}>
          <Text style={styles.checkButtonText}>확인</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  nicknameRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  inputField: {
    flex: 1,
  },
  checkButton: {
    width: 84,
    minHeight: 48,
    marginTop: 28,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[100],
  },
  checkButtonText: {
    ...typography.body1,
    color: colors.primary[500],
    fontWeight: "600",
  },
});
