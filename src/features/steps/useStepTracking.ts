import { usePedometerSteps } from "src/features/steps/usePedometerSteps";
import { useSaveSteps } from "src/features/steps/useSaveSteps";

/** 앱이 열려있는 동안 기기 만보계로 오늘 걸음수를 재고, 서버에 주기적으로 반영한다. */
export function useStepTracking() {
  const todaySteps = usePedometerSteps();
  useSaveSteps(todaySteps, { enabled: todaySteps > 0 });
  return todaySteps;
}
