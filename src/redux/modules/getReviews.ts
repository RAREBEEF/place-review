import { setFilterActionType, setReviewsActionType } from "../../types";

export const SET_REVIEWS = "SET_REVIEWS";
export const SET_FILTER = "SET_FILTER";

export const setReviews = (reviews: Array<any>): setReviewsActionType => ({
  type: SET_REVIEWS,
  reviews: reviews,
});
export const setFilter = (filter: "HERE" | "ALL"): setFilterActionType => ({
  type: SET_FILTER,
  filter,
});

const intitialState = { reviews: [], filter: "ALL" };

const reducer = (state = intitialState, action: any) => {
  switch (action.type) {
    case SET_FILTER:
      return { ...state, filter: action.filter };
    case SET_REVIEWS:
      return { ...state, reviews: action.reviews };
    default:
      return state;
  }
};

export default reducer;
