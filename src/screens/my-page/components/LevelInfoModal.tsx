import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { PressableScale } from "src/components/ui/PressableScale";
import { colors, shadow, typography } from "src/design/theme";
import { MOOD_GRADES } from "src/utils/lib/moodGrade";

type Props = {
  visible: boolean;
  totalSteps: number;
  onClose: () => void;
};

export function LevelInfoModal({ visible, totalSteps, onClose }: Props) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.card} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>걸음 등급</Text>
          <Text style={styles.subtitle}>누적 걸음수에 따라 등급이 올라가요.</Text>

          <View style={styles.list}>
            {MOOD_GRADES.map((grade, index) => {
              const nextGrade = MOOD_GRADES[index + 1];
              const isCurrent =
                totalSteps >= grade.minSteps && (!nextGrade || totalSteps < nextGrade.minSteps);
              return (
                <View key={grade.code} style={[styles.row, isCurrent && styles.rowCurrent]}>
                  <View style={styles.rowLeft}>
                    <View style={[styles.dot, isCurrent && styles.dotCurrent]} />
                    <Text style={[styles.rowName, isCurrent && styles.rowNameCurrent]}>
                      {grade.name}
                    </Text>
                  </View>
                  <Text style={[styles.rowSteps, isCurrent && styles.rowStepsCurrent]}>
                    {grade.minSteps.toLocaleString("ko-KR")}보~
                  </Text>
                </View>
              );
            })}
          </View>

          <PressableScale style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </PressableScale>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  card: {
    width: "100%",
    maxWidth: 340,
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.base[0],
    ...shadow.card,
  },
  title: { ...typography.head4, color: colors.gray[800] },
  subtitle: { ...typography.body4, color: colors.gray[600], marginTop: 4 },
  list: { marginTop: 16, gap: 4 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  rowCurrent: { backgroundColor: colors.primary[50] },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.gray[300] },
  dotCurrent: { backgroundColor: colors.primary[400] },
  rowName: { ...typography.body3, color: colors.gray[700] },
  rowNameCurrent: { color: colors.primary[500], fontWeight: "700" },
  rowSteps: { ...typography.caption1, color: colors.gray[500] },
  rowStepsCurrent: { color: colors.primary[400], fontWeight: "700" },
  closeButton: {
    marginTop: 18,
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[100],
  },
  closeButtonText: { ...typography.body3, color: colors.gray[700], fontWeight: "700" },
});
