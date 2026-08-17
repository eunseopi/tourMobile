import { useEffect, useState } from "react";
import { Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { SpotComment } from "src/components/community/Comment/types";
import { colors, typography } from "src/design/theme";

/**
 * 키보드가 열려있을 땐 KeyboardAvoidingView가 이미 키보드 바로 위까지 밀어올려주므로,
 * 홈 인디케이터용 안전영역 패딩을 그대로 더하면 입력창과 키보드 사이에 빈 틈이 생긴다.
 * 키보드가 닫혀있을 때만 안전영역 패딩을 적용한다.
 */
function useIsKeyboardVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => setVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return visible;
}

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
  const insets = useSafeAreaInsets();
  const isKeyboardVisible = useIsKeyboardVisible();
  const bottomPadding = isKeyboardVisible ? 10 : Math.max(insets.bottom, 10);

  return (
    <>
      {replyTarget ? (
        <View style={styles.replyBanner}>
          <Text style={styles.replyBannerText} numberOfLines={1}>
            {replyTarget.nickname || "댓글"}에게 답글 작성 중
          </Text>
          <Pressable onPress={onCancelReply}>
            <Text style={styles.cancelReplyText}>취소</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={[styles.inputBar, { paddingBottom: bottomPadding }]}>
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
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.bg[0],
  },
  input: {
    flex: 1,
    maxHeight: 110,
    minHeight: 48,
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: colors.gray[100],
    ...typography.body2,
    color: colors.gray[800],
  },
  submitButton: {
    minWidth: 48,
    height: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
  },
  disabledButton: {
    backgroundColor: colors.gray[400],
  },
  submitButtonText: {
    ...typography.body3,
    color: colors.base[0],
  },
});
