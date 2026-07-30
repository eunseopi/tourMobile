import { createNavigationContainerRef } from "@react-navigation/native";
import type { RootStackParamList } from "./types";

export const navigationRef = createNavigationContainerRef<RootStackParamList>();

let hasForcedLogout = false;

export function resetToLogin() {
  if (hasForcedLogout) return;
  hasForcedLogout = true;
  setTimeout(() => {
    hasForcedLogout = false;
  }, 2000);

  if (!navigationRef.isReady()) return;
  navigationRef.reset({ index: 0, routes: [{ name: "Login" }] });
}
