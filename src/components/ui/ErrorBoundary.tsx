import { Component, type PropsWithChildren, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, typography } from "src/design/theme";
import { commonStyles } from "src/design/commonStyles";
import { PressableScale } from "src/components/ui/PressableScale";

type Props = PropsWithChildren<{ fallbackTitle?: string }>;
type State = { hasError: boolean };

// react-navigation은 화면 전환 시 이전 화면을 언마운트하지 않고 스택에 쌓아두므로,
// 자식 트리 어딘가에서 던진 렌더링 예외를 여기서 잡지 못하면 앱 전체가 꺼진다(사용자 체감상 "튕김").
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (__DEV__) console.error("[ErrorBoundary]", error);
  }

  reset = () => this.setState({ hasError: false });

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{this.props.fallbackTitle ?? "문제가 발생했어요"}</Text>
        <Text style={styles.body}>잠시 후 다시 시도해주세요.</Text>
        <PressableScale style={commonStyles.primaryButton} onPress={this.reset}>
          <Text style={commonStyles.primaryButtonText}>다시 시도</Text>
        </PressableScale>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 24,
    backgroundColor: colors.bg[50],
  },
  title: {
    ...typography.body2,
    color: colors.gray[800],
  },
  body: {
    ...typography.body4,
    color: colors.gray[600],
    marginBottom: 8,
  },
});
