import Constants, { ExecutionEnvironment } from "expo-constants";

// Expo Go에는 @react-native-firebase 같은 커스텀 네이티브 모듈이 없어서,
// Expo Go에서 실행 중일 땐 Firebase 관련 코드를 전부 건너뛰어야 한다.
// (개발 빌드/EAS 빌드로 실행할 때는 false가 되어 정상적으로 Firebase를 쓴다.)
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
