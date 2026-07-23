export type MapFilter = "ALL" | "SPOT" | "POST" | "CHALLENGE";

export type MapMarkerItem = {
  id: string | number;
  name: string;
  latitude: number;
  longitude: number;
  likeCount: number;
  likedByMe?: boolean;
  imageUrls?: string[];
  type?: "POST" | "SPOT" | "CHALLENGE" | string;
  challengeOngoing?: boolean;
  distanceKm?: number | null;
};

export type ClusteredMarker =
  | { kind: "item"; item: MapMarkerItem }
  | {
      kind: "cluster";
      id: string;
      latitude: number;
      longitude: number;
      count: number;
      dominantType: "POST" | "SPOT" | "CHALLENGE";
      items: MapMarkerItem[];
    };
