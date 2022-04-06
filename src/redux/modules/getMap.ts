import {
  getMapFailActionType,
  getMapStartActionType,
  getMapSuccessActionType,
  getMapStateType,
  setMarkerPosActionType,
  setCurrentPosActionType,
} from "../../types";

export const GET_MAP_START = "GET_MAP_START";
export const GET_MAP_SUCCESS = "GET_MAP_SUCCESS";
export const GET_MAP_FAIL = "GET_MAP_FAIL";
export const SET_MARKER_POS = "SET_MARKER_POS";
export const SET_CURRENT_POS = "SET_CURRENT_POS";

export function getMapStart(): getMapStartActionType {
  return {
    type: GET_MAP_START,
  };
}
export function getMapSuccess(
  data: any,
  location: any
): getMapSuccessActionType {
  return {
    type: GET_MAP_SUCCESS,
    data,
    location,
  };
}
export function getMapFail(error: any): getMapFailActionType {
  return {
    type: GET_MAP_FAIL,
    error,
  };
}
export function setMarkerPos(markerPos: any): setMarkerPosActionType {
  return {
    type: SET_MARKER_POS,
    markerPos,
  };
}
export function setCurrentPos(currentPos: any): setCurrentPosActionType {
  return {
    type: SET_CURRENT_POS,
    currentPos,
  };
}

export function getMapThunk(element: any): Function {
  return async (dispatch: any) => {
    if (window.navigator) {
      try {
        dispatch(getMapStart());
        // 최초 위치
        const location = new window.kakao.maps.LatLng(
          37.56682420267543,
          126.978652258823
        );

        const options = {
          center: location,
          level: 3,
        };

        const map = await new window.kakao.maps.Map(element, options);
        const places = new window.kakao.maps.services.Places(map);
        const geocoder = new window.kakao.maps.services.Geocoder();

        dispatch(getMapSuccess({ map, places, geocoder }, location));
      } catch (error) {
        dispatch(getMapFail(error));
      }
    }
  };
}

const initialState: getMapStateType = {
  loading: true,
  data: { map: {}, places: {}, geocoder: {} },
  error: null,
  currentPos: null,
  markerPos: null,
};

const reducer = (
  state: getMapStateType = initialState,
  action: any
): getMapStateType => {
  switch (action.type) {
    case GET_MAP_START:
      return { ...state, loading: true, error: null };
    case GET_MAP_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        data: action.data,
        // markerPos: action.location,
      };
    case GET_MAP_FAIL:
      return { ...state, loading: false, error: action.error };
    case SET_MARKER_POS:
      return {
        ...state,
        markerPos: action.markerPos,
      };
    case SET_CURRENT_POS:
      return {
        ...state,
        currentPos: action.currentPos,
      };
    default:
      return state;
  }
};

export default reducer;
