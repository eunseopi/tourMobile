import { useEffect, useRef, useState } from "react";
import { Image } from "expo-image";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import ClearIcon from "src/assets/Clear.svg";

type Props = {
  visible: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
};

export function ImageViewerModal({ visible, images, initialIndex = 0, onClose }: Props) {
  const { width, height } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    if (!visible) return;
    setIndex(initialIndex);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ x: initialIndex * width, animated: false });
    });
  }, [visible, initialIndex, width]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.closeButton} onPress={onClose} hitSlop={10}>
          <ClearIcon width={22} height={22} />
        </Pressable>

        {images.length > 1 ? (
          <View style={styles.counter}>
            <Text style={styles.counterText}>
              {index + 1} / {images.length}
            </Text>
          </View>
        ) : null}

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            setIndex(Math.round(event.nativeEvent.contentOffset.x / width));
          }}
        >
          {images.map((uri, i) => (
            <Pressable key={`${uri}-${i}`} style={[styles.page, { width, height }]} onPress={onClose}>
              <Image
                source={{ uri }}
                style={{ width, height }}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  closeButton: {
    position: "absolute",
    top: 56,
    right: 20,
    zIndex: 1,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  counter: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    zIndex: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  counterText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  page: {
    alignItems: "center",
    justifyContent: "center",
  },
});
