const baseConfig = require("./app.json");

module.exports = () => {
  const googleMapsApiKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;

  return {
    ...baseConfig.expo,
    android: {
      ...baseConfig.expo.android,
      config: {
        ...baseConfig.expo.android?.config,
        googleMaps: googleMapsApiKey
          ? { apiKey: googleMapsApiKey }
          : baseConfig.expo.android?.config?.googleMaps,
      },
    },
  };
};
