import { MouseEventHandler } from "react";

// redux
export interface mapDataInnerdataType {
  map: any;
  places: any;
  geocoder: any;
}
export interface mapDataType {
  loading: boolean;
  data: mapDataInnerdataType;
  error: null | Error;
  markerPos: any;
}
export interface getMapStartActionType {
  type: string;
}
export interface getMapSuccessActionType {
  type: string;
  data: Object;
  markerPos: any;
}
export interface getMapFailActionType {
  type: string;
  error: Error;
}
export interface setMarkerPosActionType {
  type: string;
  markerPos: any;
}

// Map.tsx
export interface recentSearchStateType {
  text: string | number;
  type: string;
}
export interface paginationStateType {
  nextClick: MouseEventHandler<HTMLButtonElement>;
  prevClick: MouseEventHandler<HTMLButtonElement>;
  totalCount: number;
}
