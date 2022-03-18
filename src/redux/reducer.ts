import { combineReducers } from "redux";
import getMap from "./modules/getMap";
import loginProcess from "./modules/loginProcess";

const reducer = combineReducers({ getMap, loginProcess });

export default reducer;
