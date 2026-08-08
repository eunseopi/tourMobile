export function joinUniqueParts(parts: Array<string | null | undefined>, limit?: number) {
  const cleaned = parts
    .filter((value): value is string => !!value && value.trim().length > 0)
    .map((value) => value.trim());

  const deduped = cleaned.filter((value, index) => cleaned.indexOf(value) === index);

  // "노고산동"이 "노고산동 57-63" 안에 이미 포함되는 것처럼, 더 긴 값에 완전히 포함되는
  // 짧은 값은 중복 정보이므로 제거한다.
  const nonRedundant = deduped.filter(
    (value, index) =>
      !deduped.some(
        (other, otherIndex) =>
          otherIndex !== index && other.length > value.length && other.includes(value)
      )
  );

  return (limit ? nonRedundant.slice(0, limit) : nonRedundant).join(" ");
}
