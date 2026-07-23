import { StyleSheet } from "react-native";
import { colors, layout, typography, shadow } from "./theme";

export const commonStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg[0],
  },
  paddedScreen: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    backgroundColor: colors.bg[0],
  },
  bottomAction: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: layout.screenPadding,
    paddingTop: 12,
    paddingBottom: layout.bottomActionPaddingBottom,
    backgroundColor: colors.bg[0],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gray[200],
    ...shadow.card,
  },
  primaryButton: {
    minHeight: layout.buttonHeight,
    borderRadius: layout.buttonRadius,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary[400],
  },
  primaryButtonPressed: {
    backgroundColor: colors.primary[500],
  },
  primaryButtonDisabled: {
    backgroundColor: colors.gray[100],
  },
  primaryButtonText: {
    ...typography.body1,
    color: colors.base[0],
  },
  secondaryButton: {
    minHeight: layout.buttonHeight,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.gray[300],
    backgroundColor: colors.bg[0],
  },
  secondaryButtonText: {
    ...typography.body1,
    color: colors.gray[700],
  },
  input: {
    minHeight: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gray[300],
    paddingHorizontal: 14,
    backgroundColor: colors.bg[0],
    ...typography.body2,
    color: colors.gray[800],
  },
  title: {
    ...typography.head3,
    color: colors.gray[800],
  },
  guide: {
    ...typography.head2,
    color: colors.gray[800],
  },
  bodyMuted: {
    ...typography.body4,
    color: colors.gray[600],
  },
});
