import { registerRootComponent } from 'expo';
import Constants, { ExecutionEnvironment } from 'expo-constants';

import App from './App';

// Expo Go에는 @react-native-firebase 네이티브 모듈이 없으므로, Expo Go에서 실행 중일 땐
// 이 패키지를 아예 require하지 않는다 (require는 런타임에 실행되므로 정적 import와 달리
// 이 조건 안에서만 로드된다).
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (!isExpoGo) {
  // 앱이 백그라운드/종료 상태일 때 FCM data 메시지를 받으면 호출된다.
  // registerRootComponent보다 먼저, 모듈 최상위에서 등록해야 한다.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const messaging = require('@react-native-firebase/messaging');
  messaging.setBackgroundMessageHandler(messaging.getMessaging(), async () => {});
}

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
