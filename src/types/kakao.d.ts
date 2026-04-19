// kakao.maps 네임스페이스에 대한 타입 정의
declare namespace kakao.maps {
  // kakao.maps.Point 클래스에 대한 타입 정의
  class Point {
    constructor(x: number, y: number);
  }

  // kakao.maps.Size 클래스에 대한 타입 정의
  class Size {
    constructor(width: number, height: number);
  }

  // kakao.maps.LatLng 클래스에 대한 타입 정의
  class LatLng {
    constructor(lat: number, lng: number);
  }

  // kakao.maps.MarkerImage 클래스에 대한 타입 정의
  class MarkerImage {
    constructor(
      src: string,
      size: Size,
      options?: {
        alt?: string;
        coords?: string;
        offset?: Point;
        shape?: string;
        spriteOrigin?: Point;
        spriteSize?: Size;
      }
    );
  }

  class CustomOverlay {
    constructor(options?: {
      content?: HTMLElement | string;
      position?: LatLng;
      xAnchor?: number;
      yAnchor?: number;
      zIndex?: number;
    });
    setMap(map: Map | null): void;
    setPosition(position: LatLng): void;
  }

  // kakao.maps.Marker 클래스에 대한 타입 정의
  class Marker {
    constructor(options?: {
      clickable?: boolean;
      position?: LatLng;
      image?: MarkerImage;
      zIndex?: number;
      title?: string;
    });
    setMap(map: Map | null): void;
    setPosition(position: LatLng): void;
    setImage(image: MarkerImage): void;
    setZIndex(zIndex: number): void;
  }

  // kakao.maps.Map 클래스에 대한 타입 정의
  class Map {
    constructor(
      container: HTMLElement,
      options?: {
        center?: LatLng;
        level?: number;
      }
    );
    relayout(): void;
    setCenter(latlng: LatLng): void;
  }

  // kakao.maps.event 네임스페이스에 대한 타입 정의
  namespace event {
    function addListener(target: unknown, type: string, handler: (...args: unknown[]) => void): void;
  }

  // kakao.maps.load 함수에 대한 타입 정의
  function load(callback: () => void): void;
}
