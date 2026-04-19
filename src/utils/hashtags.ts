// 콤마/스페이스/줄바꿈(있을 경우) 구분자
export const DELIMS = /[,\s]+/;
export const norm = (s: string) => s.replace(/^#/, '').trim();

// 입력을 확정 토큰 + 남은 미완(partial)로 분해
export function splitTokens(raw: string) {
  const parts = raw.split(DELIMS).map(norm);
  const endedWithDelim = /[,\s]$/.test(raw); // 마지막 문자가 구분자면 partial 없음
  const partial = endedWithDelim ? '' : (parts.pop() ?? '');
  const tokens = parts.filter(Boolean);
  return { tokens, partial };
};