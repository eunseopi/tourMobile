import { useEffect, type PropsWithChildren } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { QueryClientProvider, focusManager } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { queryClient } from "src/app/queryClient";
import { navigationRef } from "src/app/navigation/navigationRef";

function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === "active");
}

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer ref={navigationRef}>{children}</NavigationContainer>
    </QueryClientProvider>
  );
}
