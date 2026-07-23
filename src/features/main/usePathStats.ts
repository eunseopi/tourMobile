import { useEffect, useRef, useState } from "react";

type Options = {
  minStepMeters?: number;
  minAccuracyOk?: number;
  strideMeters?: number;
  autoStart?: boolean;
};

export function usePathStats(
  latitude: number | null,
  longitude: number | null,
  accuracy?: number | null,
  options: Options = {}
) {
  const {
    minStepMeters = 2,
    minAccuracyOk = 80,
    strideMeters = 0.7,
    autoStart = true,
  } = options;

  const previous = useRef<{ latitude: number; longitude: number } | null>(null);
  const [meters, setMeters] = useState(0);

  useEffect(() => {
    if (latitude == null || longitude == null) return;

    if (!previous.current) {
      if (autoStart) previous.current = { latitude, longitude };
      return;
    }

    if (typeof accuracy === "number" && accuracy > minAccuracyOk) return;

    const distance = haversineMeters(
      previous.current.latitude,
      previous.current.longitude,
      latitude,
      longitude
    );

    if (distance < minStepMeters) return;

    setMeters((value) => value + distance);
    previous.current = { latitude, longitude };
  }, [accuracy, autoStart, latitude, longitude, minAccuracyOk, minStepMeters]);

  const km = meters / 1000;
  const steps = Math.floor(meters / strideMeters);

  return {
    km,
    meters,
    steps,
    formatKm: (digits = 2) => `${km.toFixed(digits)} km`,
    formatSteps: () => `${steps.toLocaleString()} 걸음`,
  };
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusMeters = 6371000;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(a));
}
