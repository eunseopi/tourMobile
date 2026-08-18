import AsyncStorage from "@react-native-async-storage/async-storage";

const HAS_ONBOARDED_KEY = "app:hasOnboarded";

export const onboardingStorage = {
  getHasOnboarded: async () => {
    const raw = await AsyncStorage.getItem(HAS_ONBOARDED_KEY);
    return raw === "true";
  },
  setHasOnboarded: () => AsyncStorage.setItem(HAS_ONBOARDED_KEY, "true"),
  clearHasOnboarded: () => AsyncStorage.removeItem(HAS_ONBOARDED_KEY),
};
