import { StyleSheet, Text, TextInput, View } from "react-native";
import type { TextInputProps, StyleProp, TextStyle, ViewStyle } from "react-native";
import { commonStyles } from "src/design/commonStyles";
import { colors, typography } from "src/design/theme";

type Props = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function FormTextField({
  label,
  error,
  containerStyle,
  inputStyle,
  style,
  placeholderTextColor = colors.gray[400],
  ...inputProps
}: Props) {
  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={placeholderTextColor}
        style={[styles.input, error ? styles.inputError : null, inputStyle, style]}
        {...inputProps}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.body3,
    color: colors.gray[700],
    marginBottom: 8,
  },
  input: {
    ...commonStyles.input,
  },
  inputError: {
    borderColor: colors.error[100],
  },
  errorText: {
    ...typography.caption1,
    color: colors.error[100],
    marginTop: 8,
  },
});
