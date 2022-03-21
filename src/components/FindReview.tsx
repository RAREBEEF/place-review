import { useEffect, useState } from "react";
import styles from "./FindReview.module.scss";
import { dbService } from "../fbase";
// import { doc, onSnapshot } from "firebase/firestore";
import { collection, query, onSnapshot } from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { stateType } from "../types";
import { setMarkerPos } from "../redux/modules/getMap";
import { map } from "@firebase/util";

const FindReview: React.FC = () => {
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
      {reviews?.map((review) => {
        const location = new window.kakao.maps.LatLng(
          review.location.Ma,
          review.location.La
        );

        if (markerPos?.La === location.La && markerPos?.Ma === location.Ma) {
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
    </ul>
  );
};

export default FindReview;
