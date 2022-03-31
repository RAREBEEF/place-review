import { combineReducers } from "redux";
import getMap from "./modules/getMap";
import loginProcess from "./modules/loginProcess";
import getReviews from "./modules/getReviews";

const reducer = combineReducers({ getMap, loginProcess, getReviews });

export default reducer;
