import React, { ReactElement, useCallback, useState } from "react";
import styles from "./FindReview.module.scss";
import { useDispatch, useSelector } from "react-redux";
import { FindReviewPropType, stateType } from "../types";
import { Link } from "react-router-dom";
import Button from "./Button";
import Review from "./Review";
import { setFilter } from "../redux/modules/getReviews";

const FindReview: React.FC<FindReviewPropType> = ({
  selected,
  setSelected,
  searchReviewPos,
}) => {
  const dispatch = useDispatch();
  const {
    getMap: { markerPos },
    getReviews: { reviews, filter },
  } = useSelector((state: stateType): stateType => state);
  const [text, setText] = useState<string>("");

  // 검색어 입력
  const onChange = useCallback((e): void => {
    setText(e.target.value);
  }, []);

  // 리뷰 필터
  const onFilterClick = useCallback((): void => {
    if (filter === "ALL") {
      dispatch(setFilter("HERE"));
    } else {
      dispatch(setFilter("ALL"));
    }
  }, [dispatch, filter]);

  return (
    <div className={styles.container}>
      <div className={styles["btn-wrapper"]}>
        <Button
          onClick={onFilterClick}
          text={filter === "ALL" ? "해당 위치 리뷰만 보기" : "전체 리뷰 보기"}
          className={["FindReview__filter"]}
        />
        <Link to="/new">
          <Button text="리뷰 작성" className={["FindReview__new-review"]} />
        </Link>
      </div>
      <div className={styles["search-wrapper"]}>
        <input
          value={text}
          onChange={onChange}
          className={styles["input--search"]}
          placeholder="리뷰 검색"
        />
      </div>
      <ul className={styles["review__list"]}>
        {reviews?.map((review: any, i: number): ReactElement | null => {
          const location = new window.kakao.maps.LatLng(
            review.location.Ma,
            review.location.La
          );

          if (filter === "ALL") {
            if (text !== "") {
              if (
                review.title.indexOf(text) === -1 &&
                review.memo.indexOf(text) === -1 &&
                review.address.address.indexOf(text) === -1 &&
                review.address.roadAddress.indexOf(text) === -1
              ) {
                return null;
              }
            }
          } else if (
            markerPos?.La !== location.La &&
            markerPos?.Ma !== location.Ma
          ) {
            return null;
          }
          return (
            <Review
              location={location}
              review={review}
              key={review.id}
              selected={selected}
              setSelected={setSelected}
              i={i}
              searchReviewPos={searchReviewPos}
            />
          );
        })}
        <div className={styles["no-review"]}>
          <div style={{ lineHeight: "23px" }}>해당 위치에 리뷰가 없습니다.</div>
          <div style={{ lineHeight: "23px" }}>첫 리뷰를 남겨보세요.</div>
        </div>
      </ul>
      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()}. RAREBEEF All Rights Reserved.
      </footer>
    </div>
  );
};

export default FindReview;
