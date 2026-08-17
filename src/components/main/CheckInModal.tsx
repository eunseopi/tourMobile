import { useEffect, useRef } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { PressableScale } from "src/components/ui/PressableScale";
import HanlabongActive from "src/assets/hanlabong.svg";
import HanlabongInactive from "src/assets/hanlabong-dis.svg";

type Props = {
  open: boolean;
  mode?: "success" | "already";
  day: number;
  reward: number;
  bonus?: number;
  onClose: () => void;
  onClaim: () => void;
};

const DAYS = [1, 2, 3, 4, 5, 6, 7];

export default function CheckInModal({
  open,
  mode = "success",
  day,
  reward,
  bonus = 0,
  onClose,
  onClaim,
}: Props) {
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const stampPop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!open) return;
    scale.setValue(0.85);
    opacity.setValue(0);
    stampPop.setValue(0);
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 10 }),
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
    ]).start();
    Animated.spring(stampPop, {
      toValue: 1,
      useNativeDriver: true,
      speed: 10,
      bounciness: 18,
      delay: 150,
    }).start();
  }, [open, scale, opacity, stampPop]);

  return (
    <Modal transparent visible={open} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.modal, { opacity, transform: [{ scale }] }]}>
          <Text style={styles.title}>
            {mode === "already" ? "오늘 출석 완료!" : "하루제주 입장을 환영해요!"}
          </Text>

          {mode === "already" ? (
            <Text style={styles.desc}>
              오늘 출석체크는 이미 완료했어요! 도장이 찍혔어요.{"\n"}내일 또 눌러서 연속
              스탬프를 이어가 보세요 🍊
            </Text>
          ) : (
            <Text style={styles.desc}>
              {day}일 출석 성공! <Text style={styles.highlight}>{reward}</Text> 한라봉을 지급했어요!
              {bonus > 0 ? (
                <>
                  {" "}
                  7일 연속 보너스 <Text style={styles.highlight}>{bonus}</Text> 추가 지급!
                </>
              ) : null}
            </Text>
          )}

          <View style={styles.board}>
            <View style={styles.row}>
              {DAYS.slice(0, 4).map((item) => (
                <Stamp key={item} item={item} active={item <= day} current={item === day} popAnim={stampPop} />
              ))}
            </View>
            <View style={styles.rowReverse}>
              {DAYS.slice(4).map((item) => (
                <Stamp key={item} item={item} active={item <= day} current={item === day} popAnim={stampPop} />
              ))}
            </View>
          </View>

          <PressableScale
            style={styles.primaryButton}
            onPress={() => {
              onClaim();
              onClose();
            }}
          >
            <Text style={styles.primaryButtonText}>홈으로 가기</Text>
          </PressableScale>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Stamp({
  item,
  active,
  current,
  label,
  popAnim,
}: {
  item: number;
  active: boolean;
  current: boolean;
  label?: string;
  popAnim: Animated.Value;
}) {
  return (
    <View style={styles.stampWrap}>
      <Animated.View
        style={[
          styles.stamp,
          active && styles.stampActive,
          current && styles.stampCurrent,
          current ? { transform: [{ scale: popAnim }] } : null,
        ]}
      >
        {active ? (
          <HanlabongActive width={34} height={34} />
        ) : (
          <HanlabongInactive width={34} height={34} />
        )}
      </Animated.View>
      <Text style={[styles.stampLabel, current && styles.stampLabelCurrent]}>
        {label ?? `${item}일차`}
      </Text>
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
  singleStampBoard: {
    marginTop: 22,
    alignItems: "center",
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
  stampCurrent: {
    borderWidth: 2,
    borderColor: "#ff8b4c",
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
