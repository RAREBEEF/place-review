import { ReactElement, useEffect, useState } from "react";
import styles from "./FindReview.module.scss";
import { dbService } from "../fbase";
// import { doc, onSnapshot } from "firebase/firestore";
import { collection, query, onSnapshot } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { FindReviewPropType, stateType } from "../types";
import { setMarkerPos } from "../redux/modules/getMap";
import { Link } from "react-router-dom";

const FindReview: React.FC<FindReviewPropType> = ({
  viewAllReview,
  setViewAllReview,
  setIsFindTab,
}) => {
  const mapData = useSelector((state: stateType) => state.getMap);
  const geocoder = mapData.data.geocoder;
  const map = mapData.data.map;
  const markerPos = mapData.markerPos;
  const dispatch = useDispatch();
  const [reviews, setReviews] = useState<Array<any>>([]);

  useEffect(() => {
    const q = query(collection(dbService, "reviews"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const reviews: Array<any> = [];
      querySnapshot.forEach((doc) => {
        reviews.push({ id: doc.id, ...doc.data() });
      });
      setReviews(reviews);
    });

    return () => {
      unsubscribe();
    };
  }, []);
  console.log(reviews);

  return (
    <ul className={styles.container}>
      <button
        onClick={() => {
          setViewAllReview(true);
        }}
      >
        전체 리뷰 보기
      </button>
      <Link to="/new">
        <button
          onClick={() => {
            setIsFindTab(true);
          }}
        >
          리뷰 작성하러 가기
        </button>
      </Link>
      {reviews?.map((review): ReactElement | null => {
        const location = new window.kakao.maps.LatLng(
          review.location.Ma,
          review.location.La
        );
        if (viewAllReview) {
          return (
            <li
              key={review.id}
              className={styles.review}
              onClick={() => {
                dispatch(setMarkerPos(location));
                map.setCenter(location);
                console.log(location);
              }}
            >
              <div className={styles["review__title"]}>{review.title}</div>
              <div className={styles["review__rating"]}>{review.rating}</div>
              <div className={styles["review__memo"]}>{review.memo}</div>
            </li>
          );
        } else if (
          markerPos?.La === location.La &&
          markerPos?.Ma === location.Ma
        ) {
          return (
            <li
              key={review.id}
              className={styles.review}
              onClick={() => {
                dispatch(setMarkerPos(location));
                map.setCenter(location);
                console.log(location);
              }}
            >
              <div className={styles["review__title"]}>{review.title}</div>
              <div className={styles["review__rating"]}>{review.rating}</div>
              <div className={styles["review__memo"]}>{review.memo}</div>
            </li>
          );
        } else {
          return null;
        }
      })}
      <div className={styles["no-review"]}>
        해당 위치에 리뷰가 존재하지 않습니다.
      </div>
    </ul>
  );
};

export default FindReview;
