import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChevronLeftIcon from "src/assets/ChevronLeft.svg";
import { colors, typography } from "src/design/theme";

type Props = {
  title: string;
  showBack?: boolean;
};

export function ScreenHeader({ title, showBack = true }: Props) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const canGoBack = showBack && navigation.canGoBack();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.row}>
        {canGoBack ? (
          <Pressable
            accessibilityLabel="뒤로가기"
            hitSlop={12}
            android_ripple={null}
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <ChevronLeftIcon width={11} height={18} />
          </Pressable>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bg[0],
  },
  row: {
    height: 52,
    justifyContent: "center",
  },
  backButton: {
    position: "absolute",
    left: 8,
    top: 0,
    bottom: 0,
    zIndex: 1,
    paddingHorizontal: 12,
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  title: {
    ...typography.head3,
    color: colors.gray[800],
    textAlign: "center",
    paddingHorizontal: 44,
  },
});
