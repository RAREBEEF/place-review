import {
  getMapFailActionType,
  getMapStartActionType,
  getMapSuccessActionType,
  mapDataType,
  setMarkerPosActionType,
} from "../../types";

// declare global {
//   interface Window {
//     kakao: any;
//   }
// }

export const GET_MAP_START = "GET_MAP_START";
export const GET_MAP_SUCCESS = "GET_MAP_SUCCESS";
export const GET_MAP_FAIL = "GET_MAP_FAIL";
export const SET_MARKER_POS = "SET_MARKER_POS";

export function getMapStart(): getMapStartActionType {
  return {
    type: GET_MAP_START,
  };
}
export function getMapSuccess(
  data: any,
  markerPos: any
): getMapSuccessActionType {
  return {
    type: GET_MAP_SUCCESS,
    data,
    markerPos,
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

export function getMapThunk(element: any): Function {
  return async (dispatch: any) => {
    if (window.navigator) {
      window.navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
          dispatch(getMapStart());

          const location = new window.kakao.maps.LatLng(
            pos.coords.latitude,
            pos.coords.longitude
          );

          const options = {
            center: location,
            level: 3,
          };

          const map = await new window.kakao.maps.Map(element, options);
          const places = new window.kakao.maps.services.Places(map);
          const geocoder = new window.kakao.maps.services.Geocoder();

          dispatch(getMapSuccess({ map, places, geocoder }, location));
          dispatch(setMarkerPos(location));
        } catch (error) {
          dispatch(getMapFail(error));
        }
      });
    } else {
      try {
        const location = new window.kakao.maps.LatLng(0, 0);

        const options = {
          center: location,
          level: 3,
        };

        const map = await new window.kakao.maps.Map(element, options);
        const places = new window.kakao.maps.services.Places(map);
        const geocoder = new window.kakao.maps.services.Geocoder();

        dispatch(
          getMapSuccess(
            { map, places, geocoder },
            new window.kakao.maps.LatLng(0, 0)
          )
        );
        dispatch(setMarkerPos(location));
      } catch (error) {
        dispatch(getMapFail(error));
      }
    }
  };
}

const initialState: mapDataType = {
  loading: true,
  data: { map: {}, places: {}, geocoder: {} },
  error: null,
  markerPos: null,
};

const reducer = (state: any = initialState, action: any): mapDataType => {
  switch (action.type) {
    case GET_MAP_START:
      return { ...state, loading: true, error: null };
    case GET_MAP_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        data: action.data,
        markerPos: action.markerPos,
      };
    case GET_MAP_FAIL:
      return { ...state, loading: false, error: action.error };
    case SET_MARKER_POS:
      console.log(action.markerPos);
      return {
        ...state,
        data: {
          ...state.data,
        },
        markerPos: action.markerPos,
      };
    default:
      return state;
  }
};

export default reducer;
