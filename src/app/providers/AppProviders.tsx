import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { queryClient } from "src/app/queryClient";
import { navigationRef } from "src/app/navigation/navigationRef";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer ref={navigationRef}>{children}</NavigationContainer>
    </QueryClientProvider>
  );
}
