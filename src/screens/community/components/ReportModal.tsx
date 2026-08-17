import { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { REPORT_REASONS, type ReportReason } from "src/api/community";
import { commonStyles } from "src/design/commonStyles";
import { colors, typography } from "src/design/theme";

type Props = {
  visible: boolean;
  targetLabel: string;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, detail: string) => void;
};

export function ReportModal({ visible, targetLabel, isSubmitting, onClose, onSubmit }: Props) {
  const [reason, setReason] = useState<ReportReason>(REPORT_REASONS[0].value);
  const [detail, setDetail] = useState("");

  const handleClose = () => {
    setReason(REPORT_REASONS[0].value);
    setDetail("");
    onClose();
  };

  const handleSubmit = () => {
    onSubmit(reason, detail.trim());
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>{targetLabel} 신고</Text>
          <Text style={styles.subtitle}>신고 사유를 선택해주세요.</Text>

          <View style={styles.reasonList}>
            {REPORT_REASONS.map((item) => {
              const active = item.value === reason;
              return (
                <Pressable
                  key={item.value}
                  style={styles.reasonRow}
                  onPress={() => setReason(item.value)}
                >
                  <View style={[styles.radio, active && styles.radioActive]}>
                    {active ? <View style={styles.radioDot} /> : null}
                  </View>
                  <Text style={styles.reasonText}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            style={styles.detailInput}
            placeholder="상세 내용을 입력해주세요 (선택)"
            placeholderTextColor={colors.gray[400]}
            value={detail}
            onChangeText={setDetail}
            multiline
          />

          <View style={styles.actionRow}>
            <Pressable style={styles.cancelButton} onPress={handleClose} disabled={isSubmitting}>
              <Text style={styles.cancelButtonText}>취소</Text>
            </Pressable>
            <Pressable
              style={[commonStyles.primaryButton, styles.submitButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <Text style={commonStyles.primaryButtonText}>
                {isSubmitting ? "신고 접수 중..." : "신고하기"}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheet: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: colors.bg[0],
  },
  title: {
    ...typography.head3,
    color: colors.gray[800],
    marginBottom: 4,
  },
  subtitle: {
    ...typography.body4,
    color: colors.gray[600],
    marginBottom: 16,
  },
  reasonList: {
    gap: 4,
    marginBottom: 14,
  },
  reasonRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray[400],
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: colors.primary[400],
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary[400],
  },
  reasonText: {
    ...typography.body3,
    color: colors.gray[700],
  },
  detailInput: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.gray[200],
    borderRadius: 10,
    padding: 12,
    ...typography.body4,
    color: colors.gray[800],
    textAlignVertical: "top",
    marginBottom: 18,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gray[100],
  },
  cancelButtonText: {
    ...typography.body1,
    color: colors.gray[600],
  },
  submitButton: {
    flex: 2,
  },
});
