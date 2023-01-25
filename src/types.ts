import { MouseEventHandler } from "react";

// redux
export interface stateType {
  getMap: any;
  loginProcess: any;
  getReviews: any;
}

// getMap
export interface mapDataType {
  map: any;
  places: any;
  geocoder: any;
}
export interface getMapStateType {
  loading: boolean;
  data: mapDataType;
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
  location: any;
}
export interface getMapFailActionType {
  type: string;
  error: Error;
}
export interface setMarkerPosActionType {
  type: string;
  markerPos: any;
}
export interface setCurrentPosActionType {
  type: string;
  currentPos: any;
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
  filter: "HERE" | "ALL";
  reviews: Array<any>;
}
export interface setReviewsActionType {
  type: string;
  reviews: Array<any>;
}
export interface setFilterActionType {
  type: string;
  filter: "HERE" | "ALL";
}

// etc
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
  searchReviewPos?: Function;
}
export interface WriteReviewPropType {
  searchResult?: Array<any>;
  selected?: { section: string | null; index: number };
  isEditMod?: boolean;
  setIsEditMod?: Function;
  prevReview?: reviewObjType;
  i?: any;
}
export interface ButtonPropType {
  text: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: any;
}
export interface ReviewPropType {
  location: any;
  review: reviewObjType;
  selected?: { section: string | null; index: number };
  setSelected?: Function;
  i?: number;
  isProfile?: boolean;
  searchReviewPos?: Function;
}
export interface HomePropType {}
export interface RouterPropType {}
export interface SearchResultPropType {
  selected: { section: string | null; index: number };
  setSelected: Function;
  place: any;
  i: number;
}
export interface currentAddressType {
  address: string | null;
  roadAddress: string | null;
}
export interface markerAddressType {
  address: string | null;
  roadAddress: string | null;
}
export interface reviewStateType {
  title: string;
  rating: number;
  memo: string;
  location: object;
  address: object;
}
export interface reviewObjType {
  id?: string;
  title: string;
  rating: number;
  memo: string;
  location: any;
  address: any;
  createdAt: number;
  creatorId: string;
  displayName: string;
  attachmentUrl: string;
  attachmentId: string;
}
