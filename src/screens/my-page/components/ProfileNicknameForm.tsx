import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { commonStyles } from "src/design/commonStyles";
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
      <Text style={styles.caption}>닉네임을 입력해주세요.</Text>
      <View style={styles.nicknameRow}>
        <TextInput
          value={nickname}
          onChangeText={onChangeNickname}
          placeholder="닉네임을 입력하세요"
          placeholderTextColor={colors.gray[400]}
          maxLength={20}
          style={[styles.input, error ? styles.inputError : null]}
        />
        <Pressable style={styles.checkButton} onPress={onValidateNickname}>
          <Text style={styles.checkButtonText}>확인</Text>
        </Pressable>
      </View>
      {error ? <Text style={styles.messageError}>{error}</Text> : null}
    </>
  );
}

const styles = StyleSheet.create({
  caption: {
    ...typography.body3,
    color: colors.gray[700],
    marginTop: 20,
    marginBottom: 8,
  },
  nicknameRow: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    ...commonStyles.input,
    flex: 1,
  },
  inputError: {
    borderColor: colors.error[100],
  },
  checkButton: {
    width: 84,
    minHeight: 48,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[100],
  },
  checkButtonText: {
    ...typography.body1,
    color: colors.gray[500],
  },
  messageError: {
    ...typography.caption1,
    color: colors.error[100],
    marginTop: 8,
  },
});
