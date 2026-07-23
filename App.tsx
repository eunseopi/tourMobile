import { RootNavigator } from "src/app/navigation/RootNavigator";
import { AppProviders } from "src/app/providers/AppProviders";
import { usePushNotificationBootstrap } from "src/features/notifications/usePushNotifications";

export default function App() {
  usePushNotificationBootstrap();

  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}
