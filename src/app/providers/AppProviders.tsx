import { useEffect, type PropsWithChildren } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider, focusManager } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { queryClient } from "src/app/queryClient";
import { navigationRef } from "src/app/navigation/navigationRef";
import { AppAlertHost } from "src/components/ui/AppAlert";
import { usePushNotificationBootstrap } from "src/features/notifications/usePushNotifications";
import { useReportedContentStore } from "src/stores/reportedContentStore";

function onAppStateChange(status: AppStateStatus) {
  focusManager.setFocused(status === "active");
}

export function AppProviders({ children }: PropsWithChildren) {
  useEffect(() => {
    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    void useReportedContentStore.getState().hydrate();
  }, []);

  usePushNotificationBootstrap();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <NavigationContainer ref={navigationRef}>
            {children}
            <AppAlertHost />
          </NavigationContainer>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
