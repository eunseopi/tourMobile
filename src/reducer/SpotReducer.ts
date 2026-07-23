import type { SpotAction, SpotCreate } from "src/types/SpotTypes";

export function spotReducer(state: SpotCreate, action: SpotAction): SpotCreate {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "SET_COORDS":
      return { ...state, latitude: action.latitude, longitude: action.longitude };
    case "SET_LOCATION_TEXT":
      return { ...state, name: action.value };
    case "REMOVE_IMAGE":
      return {
        ...state,
        images: state.images.filter((_, index) => index !== action.index),
      };
    case "RESET":
      return initialSpot;
    default:
      return state;
  }
}

export const initialSpot: SpotCreate = {
  name: "",
  description: "",
  latitude: 0,
  longitude: 0,
  themeId: 0,
  images: [],
};
