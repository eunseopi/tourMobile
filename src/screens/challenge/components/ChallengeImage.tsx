import { useEffect, useState } from "react";
import { Image, type ImageProps } from "react-native";

const DEFAULT_CHALLENGE_IMAGE = require("../../../assets/images/challenge-placeholder.png");

type Props = Omit<ImageProps, "source" | "onError"> & {
  imageUrl?: string | null;
  onRemoteError?: () => void;
};

export function ChallengeImage({ imageUrl, onRemoteError, ...imageProps }: Props) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  return (
    <Image
      {...imageProps}
      source={imageUrl && !imageFailed ? { uri: imageUrl } : DEFAULT_CHALLENGE_IMAGE}
      onError={() => {
        setImageFailed(true);
        onRemoteError?.();
      }}
      resizeMode={imageProps.resizeMode ?? "cover"}
    />
  );
}
