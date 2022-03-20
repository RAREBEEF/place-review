import { MouseEventHandler } from "react";

// redux
export interface stateType {
  getMap: any;
  loginProcess: any;
}
// getMap
export interface mapDataInnerdataType {
  map: any;
  places: any;
  geocoder: any;
}
export interface getMapStateType {
  loading: boolean;
  data: mapDataInnerdataType;
  error: null | Error;
  currentPos: any;
  markerPos: any;
}
export interface getMapStartActionType {
  type: string;
}
export interface getMapSuccessActionType {
  type: string;
  data: Object;
  currentLocation: any;
}
export interface getMapFailActionType {
  type: string;
  error: Error;
}
export interface setMarkerPosActionType {
  type: string;
  markerPos: any;
}
// loginProcess
export interface setLoginActionType {
  type: string;
  isLogin: boolean;
}
export interface loginProcessStateType {
  isLogin: boolean;
}

// Map.ts
export interface recentSearchStateType {
  text: string | number;
  type: string;
}
export interface paginationStateType {
  nextClick: MouseEventHandler<HTMLButtonElement>;
  prevClick: MouseEventHandler<HTMLButtonElement>;
  totalCount: number;
}
