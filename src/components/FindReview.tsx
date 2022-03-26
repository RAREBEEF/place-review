import React, { ReactElement, useCallback, useEffect, useState } from "react";
import styles from "./FindReview.module.scss";
import { dbService } from "../fbase";
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import { useSelector } from "react-redux";
import { FindReviewPropType, stateType } from "../types";
import { Link } from "react-router-dom";
import Button from "./Button";
import Review from "./Review";

const FindReview: React.FC<FindReviewPropType> = ({
  viewAllReview,
  setViewAllReview,
}) => {
  const mapData = useSelector((state: stateType) => state.getMap);
  const markerPos = mapData.markerPos;
  const [reviews, setReviews] = useState<Array<any>>([]);
  const [text, setText] = useState<string>("");

  useEffect(() => {
    const q = query(
      collection(dbService, "reviews"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reviews: Array<any> = [];
      querySnapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() });
      });
      setReviews(reviews);
    });
    setViewAllReview(false);
    return () => {
      unsubscribe();
    };
  }, [setViewAllReview]);

  const onChange = useCallback((e) => {
    setText(e.target.value);
  }, []);

  const onFilterClick = useCallback(() => {
    if (viewAllReview) {
      setViewAllReview(false);
    } else {
      setViewAllReview(true);
    }
  }, [viewAllReview, setViewAllReview]);

  return (
    <div className={styles.container}>
      <div className={styles["btn-wrapper"]}>
        <Button
          onClick={onFilterClick}
          text={viewAllReview ? "해당 위치 리뷰 보기" : "전체 리뷰 보기"}
        />
        <Link to="/new">
          <Button text="리뷰 작성" />
        </Link>
      </div>
      <div className={styles["search-wrapper"]}>
        <label htmlFor="search-review">리뷰 검색</label>
        <input value={text} onChange={onChange} />
      </div>
      <ul className={styles["review__list"]}>
        {reviews?.map((review): ReactElement | null => {
          const location = new window.kakao.maps.LatLng(
            review.location.Ma,
            review.location.La
          );

          if (viewAllReview) {
            if (text !== "") {
              if (
                review.title.indexOf(text) === -1 ||
                review.memo.indexOf(text) === -1
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
          return <Review location={location} review={review} key={review.id} />;
        })}
        <div className={styles["no-review"]}>
          해당 위치에 리뷰가 존재하지 않습니다.
        </div>
      </ul>
    </div>
  );
};

export default FindReview;
