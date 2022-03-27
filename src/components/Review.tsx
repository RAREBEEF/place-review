import classNames from "classnames";
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
  selected,
  setSelected,
  i,
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
      className={classNames(
        styles.review,
        selected?.section === "review" && selected.index === i && styles.selected
      )}
      onClick={() => {
        if (!map.setCenter) {
          return;
        } else {
          if (setSelected) {
            setSelected({ section: "review", index: i });
          }
          dispatch(setMarkerPos(location));
          map.setCenter(location);
        }
      }}
    >
      <div className={styles["review__header"]}>
        <span className={styles["header__title"]}>{review.title}</span>
        <span className={styles["header__rating"]}>
          <span
            className="fa fa-star"
            style={{
              color: review.rating >= 1 ? "#eb5e28" : "lightgray",
            }}
          ></span>
          <span
            className="fa fa-star"
            style={{
              color: review.rating >= 2 ? "#eb5e28" : "lightgray",
            }}
          ></span>
          <span
            className="fa fa-star"
            style={{
              color: review.rating >= 3 ? "#eb5e28" : "lightgray",
            }}
          ></span>
          <span
            className="fa fa-star"
            style={{
              color: review.rating >= 4 ? "#eb5e28" : "lightgray",
            }}
          ></span>
          <span
            className="fa fa-star"
            style={{
              color: review.rating >= 5 ? "#eb5e28" : "lightgray",
            }}
          ></span>
        </span>
      </div>
      <div className={styles["review__address"]}>{review.address.address}</div>
      <div className={styles["review__road-address"]}>
        {review.address.roadAddress}
      </div>

      <div className={styles["review__memo"]}>{review.memo}</div>
      <img
        className={styles["review__photo"]}
        src={review.attachmentUrl}
        alt={review.attachmentUrl}
      />
      <div className={styles["review__footer"]}>
        <span className={styles["footer__date"]}>
          {new Date(review.createdAt).getFullYear().toString().slice(-2)}/
          {("0" + (new Date(review.createdAt).getMonth() + 1))
            .toString()
            .slice(-2)}
          /{("0" + new Date(review.createdAt).getDate()).toString().slice(-2)}{" "}
          {("0" + new Date(review.createdAt).getHours()).slice(-2)}:
          {("0" + new Date(review.createdAt).getMinutes()).slice(-2)}
        </span>
        <span className={styles["footer__author"]}>{review.displayName}</span>
        {userObj.uid === review.creatorId && (
          <Button
            text="DELETE"
            onClick={(e) => {
              onDeleteClick(e, review);
            }}
          ></Button>
        )}
      </div>
    </li>
  );
};

export default Review;
