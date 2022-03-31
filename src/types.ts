import { MouseEventHandler } from "react";

// redux
export interface stateType {
  getMap: any;
  loginProcess: any;
  getReviews: any;
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
  userObj: any;
}
export interface loginProcessStateType {
  isLogin: boolean;
  userObj: any;
}

// getReviews
export interface getReviewsStateType {
  filter: string;
  reviews: Array<any>;
}
export interface setReviewsActionType {
  type: string;
  reviews: Array<any>;
}
export interface setFilterActionType {
  type: string;
  filter: string;
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

export interface NavPropType {}

export interface SearchPropType {}

export interface FindReviewPropType {
  onCurrentPosBtnClick: Function;
  selected: any;
  setSelected: Function;
}

export interface NewReviewPropType {}

export interface ButtonPropType {
  text: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: any;
}

export interface ReviewPropType {
  location: any;
  review: any;
  selected?: any;
  setSelected?: Function;
  i?: number;
}

export interface HomePropType {}

export interface RouterPropType {
  init: boolean;
}

export interface SearchResultPropType {
  selected: any;
  setSelected: Function;
  place: any;
  i: number;
}
