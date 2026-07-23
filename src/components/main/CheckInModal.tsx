import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

type Props = {
  open: boolean;
  day: number;
  reward: number;
  bonus?: number;
  onClose: () => void;
  onClaim: () => void;
};

const DAYS = [1, 2, 3, 4, 5, 6, 7];

export default function CheckInModal({
  open,
  day,
  reward,
  bonus = 0,
  onClose,
  onClaim,
}: Props) {
  return (
    <Modal transparent visible={open} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>하루제주 입장을 환영해요!</Text>
          <Text style={styles.desc}>
            {day}일 출석 성공! <Text style={styles.highlight}>{reward}</Text> 한라봉을 지급했어요!
            {bonus > 0 ? (
              <>
                {" "}
                7일 연속 보너스 <Text style={styles.highlight}>{bonus}</Text> 추가 지급!
              </>
            ) : null}
          </Text>

          <View style={styles.board}>
            <View style={styles.row}>
              {DAYS.slice(0, 4).map((item) => (
                <Stamp key={item} item={item} active={item <= day} current={item === day} />
              ))}
            </View>
            <View style={styles.rowReverse}>
              {DAYS.slice(4).map((item) => (
                <Stamp key={item} item={item} active={item <= day} current={item === day} />
              ))}
            </View>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              onClaim();
              onClose();
            }}
          >
            <Text style={styles.primaryButtonText}>홈으로 가기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function Stamp({
  item,
  active,
  current,
}: {
  item: number;
  active: boolean;
  current: boolean;
}) {
  return (
    <View style={styles.stampWrap}>
      <View style={[styles.stamp, active && styles.stampActive]}>
        <Text style={[styles.stampIcon, active && styles.stampIconActive]}>🍊</Text>
      </View>
      <Text style={[styles.stampLabel, current && styles.stampLabelCurrent]}>{item}일차</Text>
    </View>
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
  modal: {
    width: "100%",
    maxWidth: 360,
    padding: 22,
    borderRadius: 24,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#1f1f1f",
    textAlign: "center",
  },
  desc: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    color: "#666",
    textAlign: "center",
  },
  highlight: {
    color: "#ff8b4c",
    fontWeight: "900",
  },
  board: {
    marginTop: 22,
    gap: 16,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowReverse: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  stampWrap: {
    alignItems: "center",
    width: 68,
  },
  stamp: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f2f2",
  },
  stampActive: {
    backgroundColor: "#fff1e7",
    borderWidth: 1,
    borderColor: "#ffbf98",
  },
  stampIcon: {
    fontSize: 22,
    opacity: 0.45,
  },
  stampIconActive: {
    opacity: 1,
  },
  stampLabel: {
    marginTop: 8,
    fontSize: 12,
    color: "#888",
  },
  stampLabelCurrent: {
    color: "#ff8b4c",
    fontWeight: "800",
  },
  primaryButton: {
    marginTop: 24,
    minHeight: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ff8b4c",
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
  },
});
