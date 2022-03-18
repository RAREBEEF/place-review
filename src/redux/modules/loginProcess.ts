import { loginProcessStateType, setLoginActionType } from "../../types";

export const SET_LOGIN = "SET_LOGIN";

export function setLogin(isLogin: boolean): setLoginActionType {
  return { type: SET_LOGIN, isLogin };
}
const initialState: loginProcessStateType = { isLogin: false };

const reducer = (
  prevState: loginProcessStateType = initialState,
  action: any
): loginProcessStateType => {
  switch (action.type) {
    case SET_LOGIN:
      return { isLogin: action.isLogin };
    default:
      return prevState;
  }
};

export default reducer;
