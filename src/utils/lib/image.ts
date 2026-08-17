import * as ImageManipulator from "expo-image-manipulator";

const MAX_DIMENSION = 1440;

/**
 * iPhone 카메라의 기본 저장 포맷인 HEIC은 업로드 후 원격 URL로 다시 불러올 때
 * RN Image가 디코딩하지 못해 회색 화면으로 보인다. 업로드 전에 항상 JPEG로 변환한다.
 * 카메라 원본은 리사이즈 없이 올리면 수 MB에 달해 느린 네트워크에서 업로드가
 * 타임아웃되므로, 긴 변을 MAX_DIMENSION 이하로 줄여서 전송 크기를 낮춘다.
 */
export async function toJpeg(
  uri: string,
  options?: { base64?: boolean; width?: number; height?: number },
) {
  const { width, height } = options ?? {};
  const needsResize =
    !!width && !!height && Math.max(width, height) > MAX_DIMENSION;
  const actions = needsResize
    ? [
        {
          resize:
            width >= height
              ? { width: MAX_DIMENSION }
              : { height: MAX_DIMENSION },
        },
      ]
    : [];

  try {
    const result = await ImageManipulator.manipulateAsync(uri, actions, {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: options?.base64,
    });
    return result;
  } catch {
    return { uri, base64: undefined as string | undefined };
  }
}
