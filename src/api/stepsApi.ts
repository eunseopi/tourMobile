import api from "./instance";

export const stepsApi = {
  save: (stepCount: number) => api.post("v1/steps", { stepCount }),
};
