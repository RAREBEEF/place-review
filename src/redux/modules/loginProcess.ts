import { loginProcessStateType, setLoginActionType } from "../../types";

export const SET_LOGIN = "SET_LOGIN";
export const SET_USER_OBJ = "SET_USER_OBJ";

export function setLogin(isLogin: boolean, userObj: any): setLoginActionType {
  return { type: SET_LOGIN, isLogin, userObj };
}

const initialState: loginProcessStateType = { isLogin: false, userObj: {} };

const reducer = (
  prevState: loginProcessStateType = initialState,
  action: any
): loginProcessStateType => {
  switch (action.type) {
    case SET_LOGIN:
      return { isLogin: action.isLogin, userObj: action.userObj };
    case SET_USER_OBJ:
      return { isLogin: true, userObj: action.userObj };
    default:
      return prevState;
  }
};

export default reducer;
