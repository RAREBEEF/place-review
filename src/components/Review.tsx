import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { ReactElement, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dbService, storageService } from "../fbase";
import { setMarkerPos } from "../redux/modules/getMap";
import { ReviewPropType, stateType } from "../types";
import Button from "./Button";
import styles from "./Review.module.scss";

const Review: React.FC<ReviewPropType> = ({
  location,
  review,
}): ReactElement => {
  const dispatch = useDispatch();
  const state = useSelector((state: stateType) => state);

  const { userObj } = state.loginProcess;
  const { map } = state.getMap.data;

  const onDeleteClick = useCallback(
    async (e, review) => {
      e.preventDefault();
      console.log(review);
      const ok = window.confirm("삭제하시겠습니까?");
      if (ok) {
        await deleteDoc(doc(dbService, `reviews/${review.id}`));

        if (review.attachmentUrl !== "") {
          const attachmentRef = ref(
            storageService,
            `${userObj.uid}/${review.attachmentId}`
          );
          await deleteObject(attachmentRef);
        }
      }
    },
    [userObj.uid]
  );

  return (
    <li
      className={styles.review}
      onClick={() => {
        dispatch(setMarkerPos(location));
        map.setCenter(location);
      }}
    >
      <div className={styles["review__title"]}>{review.title}</div>
      <div className={styles["review__date"]}>
        {new Date(review.createdAt).getFullYear().toString().slice(-2)}/
        {("0" + (new Date(review.createdAt).getMonth() + 1))
          .toString()
          .slice(-2)}
        /{("0" + new Date(review.createdAt).getDate()).toString().slice(-2)}{" "}
        {("0" + new Date(review.createdAt).getHours()).slice(-2)}:
        {("0" + new Date(review.createdAt).getMinutes()).slice(-2)}
      </div>
      <div className={styles["review__author"]}>{review.displayName}</div>
      <div className={styles["rating"]}>
        <span
          className="fa fa-star"
          style={{
            color: review.rating >= 1 ? "orange" : "lightgray",
          }}
        ></span>
        <span
          className="fa fa-star"
          style={{
            color: review.rating >= 2 ? "orange" : "lightgray",
          }}
        ></span>
        <span
          className="fa fa-star"
          style={{
            color: review.rating >= 3 ? "orange" : "lightgray",
          }}
        ></span>
        <span
          className="fa fa-star"
          style={{
            color: review.rating >= 4 ? "orange" : "lightgray",
          }}
        ></span>
        <span
          className="fa fa-star"
          style={{
            color: review.rating >= 5 ? "orange" : "lightgray",
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
};

export default Review;
