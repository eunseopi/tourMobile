export interface SpotCreate {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  themeId: number;
  tag1?: string;
  tag2?: string;
  tag3?: string;
  images: File[];
}

export type SpotAction =
| { type: "SET_FIELD"; field: keyof SpotCreate; value: SpotCreate[keyof SpotCreate] } 
| { type: "REMOVE_IMAGE"; index: number }
| { type: "SET_COORDS"; latitude: number; longitude: number }
| { type: "SET_LOCATION_TEXT"; value: string }
| { type: "RESET" };