import * as Location from "expo-location";

// getCurrentPositionAsync (Play Services의 단발성 getCurrentLocation() 호출)는
// 위치 제공자가 아직 "워밍업"되지 않은 상태에서는 ERR_CURRENT_LOCATION_IS_UNAVAILABLE로
// 실패하는 경우가 실기기/에뮬레이터를 가리지 않고 흔하다 — Google 지도 앱은 같은 상황에서도
// 위치를 잘 잡는데, 지도 앱은 단발성 요청이 아니라 지속 구독(watchPosition)으로 위치를
// 받기 때문이다. 그래서 단발성 요청이 실패하면 짧게 위치 구독을 열어 첫 업데이트를
// 받는 방식으로 재시도하고, 그마저 시간 안에 안 오면 마지막으로 OS에 캐시된 위치를 쓴다.
const WATCH_FALLBACK_TIMEOUT_MS = 8000;

function currentPositionWithTimeout(): Promise<Location.LocationObject | null> {
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value: Location.LocationObject | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const timeout = setTimeout(() => finish(null), WATCH_FALLBACK_TIMEOUT_MS);
    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      .then((position) => {
        clearTimeout(timeout);
        finish(position);
      })
      .catch(() => {
        clearTimeout(timeout);
        finish(null);
      });
  });
}

function watchForOnePosition(): Promise<Location.LocationObject | null> {
  return new Promise((resolve) => {
    let settled = false;
    let subscription: Location.LocationSubscription | null = null;

    const finish = (value: Location.LocationObject | null) => {
      if (settled) return;
      settled = true;
      subscription?.remove();
      resolve(value);
    };

    const timeout = setTimeout(() => finish(null), WATCH_FALLBACK_TIMEOUT_MS);

    Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Balanced, timeInterval: 1000, distanceInterval: 0 },
      (location) => {
        clearTimeout(timeout);
        finish(location);
      }
    )
      .then((sub) => {
        subscription = sub;
        if (settled) sub.remove();
      })
      .catch(() => finish(null));
  });
}

// 두 전략 중 먼저 실제 위치를 준 쪽을 즉시 채택한다. Promise.all로 기다리면 한쪽이
// 이미 성공해도 (최대 8초 타임아웃으로 끝나는) 나머지 전략까지 기다리게 되어,
// 지도 화면 진입 시 위치를 잡는 데 불필요하게 오래 걸리는 원인이 된다.
function firstSuccessfulPosition(
  candidates: Promise<Location.LocationObject | null>[],
): Promise<Location.LocationObject | null> {
  return new Promise((resolve) => {
    let settled = false;
    let remaining = candidates.length;

    candidates.forEach((candidate) => {
      candidate.then((value) => {
        if (settled) return;
        if (value) {
          settled = true;
          resolve(value);
          return;
        }
        remaining -= 1;
        if (remaining === 0 && !settled) {
          settled = true;
          resolve(null);
        }
      });
    });
  });
}

export async function getCurrentPositionWithFallback() {
  // 실기기는 지속 구독이, 일부 에뮬레이터는 단발성 요청이 더 안정적이라 둘 다 열어두되,
  // 둘 중 먼저 성공하는 결과를 바로 쓴다(둘 다 실패해야 아래 마지막 캐시 위치로 넘어간다).
  const position = await firstSuccessfulPosition([
    currentPositionWithTimeout(),
    watchForOnePosition(),
  ]);
  if (position) return position;

  const lastKnown = await Location.getLastKnownPositionAsync({});
  if (lastKnown) return lastKnown;

  const error = new Error("Current location is unavailable") as Error & { code: string };
  error.code = "ERR_CURRENT_LOCATION_IS_UNAVAILABLE";
  throw error;
}

// getCurrentPositionAsync/getLastKnownPositionAsync가 던지는 에러 코드별로 실제
// 원인에 맞는 안내를 준다. 기본 "가져오지 못했어요"만 보여주면 기기 위치 서비스가
// 꺼져 있는 경우에도 사용자는 뭘 해야 할지 알 수 없다.
export function getLocationErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | undefined)?.code;
  if (code === "ERR_CURRENT_LOCATION_IS_UNAVAILABLE" || code === "ERR_LOCATION_SETTINGS_UNSATISFIED") {
    return "기기의 위치 서비스(GPS)가 꺼져 있는지 확인해주세요.";
  }
  return "현재 위치를 가져오지 못했어요.";
}

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
