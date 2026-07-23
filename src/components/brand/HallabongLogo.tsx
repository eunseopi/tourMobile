import { StyleSheet, View } from "react-native";

type Props = {
  size?: number;
};

export function HallabongLogo({ size = 160 }: Props) {
  const scale = size / 160;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <View
        style={[
          styles.fruit,
          {
            width: 100 * scale,
            height: 100 * scale,
            borderRadius: 50 * scale,
            left: 30 * scale,
            top: 44 * scale,
          },
        ]}
      >
        <View
          style={[
            styles.highlight,
            {
              width: 40 * scale,
              height: 40 * scale,
              borderRadius: 20 * scale,
              left: 4 * scale,
              top: 3 * scale,
            },
          ]}
        />
      </View>
      <View
        style={[
          styles.leafLarge,
          {
            width: 72 * scale,
            height: 28 * scale,
            borderTopLeftRadius: 36 * scale,
            borderBottomRightRadius: 36 * scale,
            left: 58 * scale,
            top: 22 * scale,
            transform: [{ rotate: "22deg" }],
          },
        ]}
      />
      <View
        style={[
          styles.leafSmall,
          {
            width: 34 * scale,
            height: 22 * scale,
            borderTopLeftRadius: 18 * scale,
            borderBottomRightRadius: 18 * scale,
            left: 86 * scale,
            top: 12 * scale,
            transform: [{ rotate: "58deg" }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
  },
  fruit: {
    position: "absolute",
    backgroundColor: "#FF9D00",
    overflow: "hidden",
  },
  highlight: {
    position: "absolute",
    backgroundColor: "#FFBA4B",
  },
  leafLarge: {
    position: "absolute",
    backgroundColor: "#54A16E",
  },
  leafSmall: {
    position: "absolute",
    backgroundColor: "#54A16E",
  },
});
