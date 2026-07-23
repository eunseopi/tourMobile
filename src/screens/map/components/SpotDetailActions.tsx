import { Pressable, StyleSheet, Text, View } from "react-native";
import { commonStyles } from "src/design/commonStyles";

type Props = {
  onOpenMap: () => void;
  onOpenCommunity: () => void;
};

export function SpotDetailActions({ onOpenMap, onOpenCommunity }: Props) {
  return (
    <View style={styles.actionRow}>
      <Pressable style={styles.primaryButton} onPress={onOpenMap}>
        <Text style={styles.primaryButtonText}>지도에서 보기</Text>
      </Pressable>
      <Pressable style={styles.secondaryButton} onPress={onOpenCommunity}>
        <Text style={styles.secondaryButtonText}>커뮤니티로</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  primaryButton: {
    ...commonStyles.primaryButton,
    flex: 1,
  },
  primaryButtonText: {
    ...commonStyles.primaryButtonText,
  },
  secondaryButton: {
    ...commonStyles.secondaryButton,
    flex: 1,
  },
  secondaryButtonText: {
    ...commonStyles.secondaryButtonText,
  },
});
