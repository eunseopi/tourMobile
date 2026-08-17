import { useEffect, useRef, useState } from "react";
import { Pedometer } from "expo-sensors";

/**
 * 기기 만보계(코어모션/걸음수 센서) 기반 "오늘 걸음수". 앱이 포그라운드에 떠 있는 동안만
 * 갱신되며(백그라운드 추적은 하지 않음), 오늘 자정부터의 기록을 기준선으로 잡고
 * 그 이후 실시간 증가분을 더해 보여준다.
 */
export function usePedometerSteps() {
  const [todaySteps, setTodaySteps] = useState(0);
  const baselineRef = useRef(0);

  useEffect(() => {
    let isMounted = true;
    let subscription: { remove: () => void } | null = null;

    (async () => {
      try {
        const isAvailable = await Pedometer.isAvailableAsync();
        if (!isAvailable) return;

        const permission = await Pedometer.requestPermissionsAsync();
        if (!permission.granted) return;

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        try {
          const result = await Pedometer.getStepCountAsync(startOfDay, now);
          if (isMounted) {
            baselineRef.current = result.steps;
            setTodaySteps(result.steps);
          }
        } catch {
          // 기기가 과거 기록 조회를 지원하지 않으면 0부터 실시간 카운트만 쌓는다.
        }

        subscription = Pedometer.watchStepCount((result) => {
          if (isMounted) {
            setTodaySteps(baselineRef.current + result.steps);
          }
        });
      } catch {
        // 만보계를 못 쓰는 기기/환경 — 걸음수는 0으로 유지된다.
      }
    })();

    return () => {
      isMounted = false;
      subscription?.remove();
    };
  }, []);

  return todaySteps;
}
