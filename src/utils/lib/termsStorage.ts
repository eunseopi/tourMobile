import AsyncStorage from "@react-native-async-storage/async-storage";

const HAS_AGREED_TERMS_KEY = "app:hasAgreedTerms";

export const termsStorage = {
  getHasAgreed: async () => {
    const raw = await AsyncStorage.getItem(HAS_AGREED_TERMS_KEY);
    return raw === "true";
  },
  setHasAgreed: () => AsyncStorage.setItem(HAS_AGREED_TERMS_KEY, "true"),
};
