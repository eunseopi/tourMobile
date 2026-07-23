import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { SpotComment } from "src/components/community/Comment/types";
import { colors, typography } from "src/design/theme";

type Props = {
  text: string;
  replyTarget: SpotComment | null;
  isSubmitting: boolean;
  onChangeText: (value: string) => void;
  onCancelReply: () => void;
  onSubmit: () => void;
};

export function PostCommentComposer({
  text,
  replyTarget,
  isSubmitting,
  onChangeText,
  onCancelReply,
  onSubmit,
}: Props) {
  const disabled = !text.trim() || isSubmitting;

  return (
    <>
      {replyTarget ? (
        <View style={styles.replyBanner}>
          <Text style={styles.replyBannerText} numberOfLines={1}>
            {replyTarget.userNickname || "댓글"}에게 답글 작성 중
          </Text>
          <Pressable onPress={onCancelReply}>
            <Text style={styles.cancelReplyText}>취소</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.inputBar}>
        <TextInput
          value={text}
          onChangeText={onChangeText}
          placeholder={replyTarget ? "답글을 입력하세요." : "댓글을 입력하세요."}
          placeholderTextColor="#aaa"
          multiline
          style={styles.input}
        />
        <Pressable style={[styles.submitButton, disabled && styles.disabledButton]} disabled={disabled} onPress={onSubmit}>
          <Text style={styles.submitButtonText}>{isSubmitting ? "작성 중" : "등록"}</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  replyBanner: {
    minHeight: 38,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.primary[50],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.primary[200],
  },
  replyBannerText: {
    flex: 1,
    ...typography.caption1,
    color: colors.primary[500],
  },
  cancelReplyText: {
    marginLeft: 12,
    ...typography.caption1,
    color: colors.primary[400],
  },
  inputBar: {
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    backgroundColor: colors.bg[0],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray[200],
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 12,
    backgroundColor: colors.gray[100],
    ...typography.body4,
    color: colors.gray[800],
  },
  submitButton: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
  },
  disabledButton: {
    backgroundColor: colors.gray[100],
  },
  submitButtonText: {
    ...typography.body3,
    color: colors.base[0],
  },
});
