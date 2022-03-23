import React, { ReactElement, useCallback, useEffect, useState } from "react";
import styles from "./FindReview.module.scss";
import { dbService, storageService } from "../fbase";
import {
  collection,
  query,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useDispatch, useSelector } from "react-redux";
import { FindReviewPropType, stateType } from "../types";
import { setMarkerPos } from "../redux/modules/getMap";
import { Link } from "react-router-dom";
import Button from "./Button";
import { deleteObject, ref } from "firebase/storage";

const FindReview: React.FC<FindReviewPropType> = ({
  viewAllReview,
  setViewAllReview,
  setIsFindTab,
  onCurrentPosBtnClick,
}) => {
  const mapData = useSelector((state: stateType) => state.getMap);
  const userObj = useSelector((state: stateType) => state.loginProcess.userObj);
  const map = mapData.data.map;
  const markerPos = mapData.markerPos;
  const dispatch = useDispatch();
  const [reviews, setReviews] = useState<Array<any>>([]);
  const [text, setText] = useState<string>("");

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

  const onChange = useCallback((e) => {
    setText(e.target.value);
  }, []);
  console.log(text);

  const onClick = useCallback(() => {
    if (viewAllReview) {
      setViewAllReview(false);
      // onCurrentPosBtnClick();
    } else {
      setViewAllReview(true);
    }
  }, [viewAllReview, setViewAllReview]);

  const onDeleteClick = useCallback(async (e, review) => {
    e.preventDefault();
    console.log(review);
    const ok = window.confirm("삭제하시겠습니까?");
    if (ok) {
      // await dbService.doc(`mebs/${e.target.review.id}`).delete();

      await deleteDoc(doc(dbService, `reviews/${review.id}`));

      if (review.attachmentUrl !== "") {
        // await storageService.refFromURL(e.target.review.attachmentUrl).delete();
        const attachmentRef = ref(
          storageService,
          `${userObj.uid}/${review.attachmentId}`
        );
        await deleteObject(attachmentRef);
      }
    }
    // if (typeof setDoUpdate === "function") {
    //   setDoUpdate((prev) => prev + 1);
    // }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles["btn-wrapper"]}>
        <Button
          onClick={onClick}
          text={viewAllReview ? "해당 위치 리뷰 보기" : "전체 리뷰 보기"}
        />
        <Link to="/new">
          <Button
            onClick={() => {
              setIsFindTab(false);
            }}
            text="리뷰 작성"
          />
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
              <div className={styles["review__author"]}>
                {review.displayName}
              </div>
              <div className={styles["rating"]}>
                <span
                  className="fa fa-star"
                  style={{
                    color: review.rating >= 1 ? "orange" : "gray",
                  }}
                ></span>
                <span
                  className="fa fa-star"
                  style={{
                    color: review.rating >= 2 ? "orange" : "gray",
                  }}
                ></span>
                <span
                  className="fa fa-star"
                  style={{
                    color: review.rating >= 3 ? "orange" : "gray",
                  }}
                ></span>
                <span
                  className="fa fa-star"
                  style={{
                    color: review.rating >= 4 ? "orange" : "gray",
                  }}
                ></span>
                <span
                  className="fa fa-star"
                  style={{
                    color: review.rating >= 5 ? "orange" : "gray",
                  }}
                ></span>
              </div>
              <div className={styles["review__memo"]}>{review.memo}</div>
              <img
                className={styles["review__photo"]}
                src={review.attachmentUrl}
                alt={review.attachmentUrl}
              />
              {userObj.uid === review.creatorId && (
                <Button
                  text="DELETE"
                  onClick={(e) => {
                    onDeleteClick(e, review);
                  }}
                ></Button>
              )}
            </li>
          );
        })}
        <div className={styles["no-review"]}>
          해당 위치에 리뷰가 존재하지 않습니다.
        </div>
      </ul>
    </div>
  );
};

export default FindReview;
