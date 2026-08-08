import * as ImageManipulator from "expo-image-manipulator";

/**
 * iPhone 카메라의 기본 저장 포맷인 HEIC은 업로드 후 원격 URL로 다시 불러올 때
 * RN Image가 디코딩하지 못해 회색 화면으로 보인다. 업로드 전에 항상 JPEG로 변환한다.
 */
export async function toJpeg(uri: string, options?: { base64?: boolean }) {
  try {
    const result = await ImageManipulator.manipulateAsync(uri, [], {
      compress: 0.9,
      format: ImageManipulator.SaveFormat.JPEG,
      base64: options?.base64,
    });
    return result;
  } catch {
    return { uri, base64: undefined as string | undefined };
  }
}
