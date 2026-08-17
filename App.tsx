import { StatusBar } from "expo-status-bar";
import { RootNavigator } from "src/app/navigation/RootNavigator";
import { AppProviders } from "src/app/providers/AppProviders";
import { usePushNotificationBootstrap } from "src/features/notifications/usePushNotifications";

export default function App() {
  usePushNotificationBootstrap();

  return (
    <AppProviders>
      {/* 앱이 밝은 배경 위주라 시스템 상태바(시간/배터리 등)가 항상 어두운 색으로 보이도록 고정한다. */}
      <StatusBar style="dark" />
      <RootNavigator />
    </AppProviders>
  );
}
