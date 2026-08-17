import { useEffect, useRef, useState } from "react";
import { Animated, Modal, StyleSheet, Text, View } from "react-native";
import { PressableScale } from "src/components/ui/PressableScale";
import { colors, shadow, typography } from "src/design/theme";
import HanlabongIcon from "src/assets/hanlabong.svg";

type AlertButtonStyle = "default" | "cancel" | "destructive";
export type AlertButton = {
  text?: string;
  onPress?: (value?: string) => void;
  style?: AlertButtonStyle;
};
type AlertState = { title: string; message?: string; buttons: AlertButton[] } | null;

let currentState: AlertState = null;
let listeners: Array<(state: AlertState) => void> = [];

function publish(state: AlertState) {
  currentState = state;
  listeners.forEach((listener) => listener(state));
}

/**
 * RN Alert.alert와 동일한 시그니처의 드롭인 대체 — react-native의 기본 OS 얼럿 대신
 * 하루제주 브랜드가 적용된 커스텀 다이얼로그를 띄운다. 호출부 코드는 그대로 두고
 * `import { Alert } from "react-native"` 대신 이 모듈에서 import만 바꾸면 된다.
 */
function alert(title: string, message?: string, buttons?: AlertButton[]) {
  const finalButtons = buttons && buttons.length > 0 ? buttons : [{ text: "확인" }];
  publish({ title, message, buttons: finalButtons });
}

export const Alert = { alert };

export function AppAlertHost() {
  const [state, setState] = useState<AlertState>(null);
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter((listener) => listener !== setState);
    };
  }, []);

  useEffect(() => {
    if (!state) return;
    scale.setValue(0.9);
    opacity.setValue(0);
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 16, bounciness: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
  }, [state, scale, opacity]);

  if (!state) return null;

  const handlePress = (button: AlertButton) => {
    publish(null);
    button.onPress?.();
  };

  const isColumn = state.buttons.length > 2;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => publish(null)}>
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <View style={styles.brandRow}>
            <HanlabongIcon width={18} height={18} />
            <Text style={styles.brandText}>하루제주</Text>
          </View>
          <Text style={styles.title}>{state.title}</Text>
          {state.message ? <Text style={styles.message}>{state.message}</Text> : null}

          <View style={isColumn ? styles.buttonColumn : styles.buttonRow}>
            {state.buttons.map((button, index) => (
              <PressableScale
                key={index}
                scaleTo={0.96}
                style={[
                  styles.button,
                  !isColumn && styles.buttonFlex,
                  button.style === "cancel" && styles.cancelButton,
                  button.style === "destructive" && styles.destructiveButton,
                ]}
                onPress={() => handlePress(button)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === "cancel" && styles.cancelButtonText,
                    button.style === "destructive" && styles.destructiveButtonText,
                  ]}
                >
                  {button.text ?? "확인"}
                </Text>
              </PressableScale>
            ))}
          </View>
        </Animated.View>
      </View>
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
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 10,
  },
  brandText: {
    ...typography.caption1,
    color: colors.primary[500],
    fontWeight: "700",
  },
  title: {
    ...typography.head4,
    color: colors.gray[800],
  },
  message: {
    ...typography.body4,
    color: colors.gray[600],
    marginTop: 6,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },
  buttonColumn: {
    gap: 8,
    marginTop: 18,
  },
  button: {
    minHeight: 46,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    backgroundColor: colors.primary[400],
  },
  buttonFlex: {
    flex: 1,
  },
  cancelButton: {
    backgroundColor: colors.gray[100],
  },
  destructiveButton: {
    backgroundColor: colors.error[100],
  },
  buttonText: {
    ...typography.body3,
    color: colors.base[0],
    fontWeight: "700",
  },
  cancelButtonText: {
    color: colors.gray[700],
  },
  destructiveButtonText: {
    color: colors.base[0],
  },
});
