import { useEffect, useRef } from "react";
import type { PropsWithChildren } from "react";
import { Animated, Modal, Pressable, StyleSheet, View } from "react-native";
import ClearIcon from "src/assets/Clear.svg";
import { colors, shadow } from "src/design/theme";

type Props = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  variant?: "sheet" | "center";
  showCloseButton?: boolean;
}>;

// 앱 전체에서 쓰는 공통 모달 wrapper — 배경/모서리/닫기 버튼/등장 애니메이션을 하나로 통일한다.
export function AppModal({ visible, onClose, variant = "sheet", showCloseButton = true, children }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    progress.setValue(0);
    Animated.spring(progress, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 8 }).start();
  }, [visible, progress]);

  const contentStyle =
    variant === "sheet"
      ? {
          transform: [
            {
              translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }),
            },
          ],
          opacity: progress,
        }
      : {
          transform: [{ scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
          opacity: progress,
        };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={[styles.backdrop, { justifyContent: variant === "sheet" ? "flex-end" : "center" }]}
        onPress={onClose}
      >
        <Animated.View
          style={[
            variant === "sheet" ? styles.sheetCard : styles.centerCard,
            contentStyle,
          ]}
          onStartShouldSetResponder={() => true}
        >
          {showCloseButton ? (
            <Pressable style={styles.closeButton} onPress={onClose} hitSlop={12} accessibilityLabel="닫기">
              <ClearIcon width={20} height={20} />
            </Pressable>
          ) : null}
          <View style={variant === "sheet" ? styles.sheetBody : styles.centerBody}>{children}</View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheetCard: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  centerCard: {
    alignSelf: "center",
    marginHorizontal: 24,
    borderRadius: 16,
    backgroundColor: colors.bg[0],
    ...shadow.card,
  },
  centerBody: {
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 1,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
});
