export const formatDate = (isoString?: string): string => {
  if (!isoString) return "";

  try {
    // ISO → Date 객체 변환
    const date = new Date(isoString);

    // yyyy-mm-dd 포맷
    return date.toISOString().split("T")[0];
  } catch (e) {
    console.error("Invalid date string:", isoString, e);
    return "";
  }
};