import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import ErrorIcon from "src/assets/error.svg";
import { colors, typography } from "src/design/theme";

type Props = {
  message: string;
  visible: boolean;
  onClose: () => void;
};

export function ErrorToast({ message, visible, onClose }: Props) {
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <View style={styles.wrapper} pointerEvents="none">
      <ErrorIcon width={24} height={24} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 125,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    paddingVertical: 16,
    paddingLeft: 16,
    paddingRight: 18,
    backgroundColor: colors.gray[800],
  },
  text: {
    flex: 1,
    ...typography.body1,
    color: colors.bg[0],
  },
});
