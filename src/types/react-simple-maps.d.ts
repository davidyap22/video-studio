declare module "react-simple-maps" {
  import { FC, ReactNode } from "react";

  interface ComposableMapProps {
    projection?: string;
    projectionConfig?: {
      rotate?: [number, number] | [number, number, number];
      center?: [number, number];
      scale?: number;
    };
    width?: number;
    height?: number;
    style?: React.CSSProperties;
    children?: ReactNode;
  }

  interface GeographiesProps {
    geography: string | object;
    children: (props: { geographies: Geography[] }) => ReactNode;
  }

  interface Geography {
    id: string;
    rsmKey: string;
    properties: {
      NAME?: string;
      name?: string;
      [key: string]: unknown;
    };
    geometry: object;
  }

  interface GeographyProps {
    geography: Geography;
    fill?: string;
    fillOpacity?: number;
    stroke?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    style?: {
      default?: React.CSSProperties;
      hover?: React.CSSProperties;
      pressed?: React.CSSProperties;
    };
    [key: string]: unknown;
  }

  interface MarkerProps {
    coordinates: [number, number];
    children?: ReactNode;
  }

  interface ZoomableGroupProps {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    translateExtent?: [[number, number], [number, number]];
    children?: ReactNode;
  }

  interface GraticuleProps {
    stroke?: string;
    strokeWidth?: number;
    strokeOpacity?: number;
    step?: [number, number];
  }

  interface SphereProps {
    stroke?: string;
    strokeWidth?: number;
    fill?: string;
  }

  export const ComposableMap: FC<ComposableMapProps>;
  export const Geographies: FC<GeographiesProps>;
  export const Geography: FC<GeographyProps>;
  export const Marker: FC<MarkerProps>;
  export const ZoomableGroup: FC<ZoomableGroupProps>;
  export const Graticule: FC<GraticuleProps>;
  export const Sphere: FC<SphereProps>;
}
