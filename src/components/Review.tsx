import classNames from "classnames";
import { deleteDoc, doc } from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { ReactElement, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { dbService, storageService } from "../fbase";
import { setMarkerPos } from "../redux/modules/getMap";
import { ReviewPropType, stateType } from "../types";
import Button from "./Button";
import NewReview from "./NewReview";
import styles from "./Review.module.scss";

const Review: React.FC<ReviewPropType> = ({
  location,
  review,
  selected,
  setSelected,
  i,
  isProfile,
  searchReviewPos,
}): ReactElement => {
  const dispatch = useDispatch();
  const {
    getMap: {
      data: { map },
    },
    loginProcess: { userObj },
  } = useSelector((state: stateType): stateType => state);
  const [isEditMod, setIsEditMod] = useState<boolean>(false);

  const onDeleteClick = useCallback(
    async (e, review): Promise<void> => {
      e.preventDefault();

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

  const onEditClick = useCallback(
    (e, review) => {
      e.preventDefault();

      if (isEditMod) {
        window.alert(
          "현재 수정 중인 다른 글이 존재합니다.\n수정 완료 후 다시 시도해 주세요."
        );
      }

      setIsEditMod(true);
    },
    [isEditMod]
  );

  useEffect(() => {
    if (selected && selected.section === "review" && selected.index !== i) {
      setIsEditMod(false);
    }
  }, [i, selected]);

  return (
    <li
      className={classNames(
        styles.review,
        selected?.section === "review" &&
          selected.index === i &&
          styles.selected,
        isProfile && styles["profile-page"],
        isEditMod && styles["edit-mod"]
      )}
      onClick={(): void => {
        if (!map.setCenter) {
          return;
        } else {
          if (setSelected) {
            setSelected({ section: "review", index: i });
          }
          dispatch(setMarkerPos(location));
          map.setCenter(location);
          if (searchReviewPos) {
            searchReviewPos(location, i);
          }
        }
      }}
    >
      {isEditMod ? (
        <NewReview
          isEditMod={isEditMod}
          setIsEditMod={setIsEditMod}
          prevReview={review}
          selected={selected}
          i={i}
        />
      ) : (
        <>
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
          <div className={styles["review__address"]}>
            <div className={styles["address__address"]}>
              {review.address.address}
            </div>
            <div className={styles["address__road-address"]}>
              {review.address.roadAddress}
            </div>
          </div>
          <hr className={styles.line} />
          <div className={styles["review__content"]}>
            <p className={styles["review__memo"]}>{review.memo}</p>
            {review.attachmentUrl && (
              <img
                className={styles["review__photo"]}
                src={review.attachmentUrl}
                alt={review.attachmentUrl}
              />
            )}
          </div>
          <hr className={styles.line} />
          <div className={styles["review__footer"]}>
            <span className={styles["footer__date"]}>
              {new Date(review.createdAt).getFullYear().toString().slice(-2)}/
              {("0" + (new Date(review.createdAt).getMonth() + 1))
                .toString()
                .slice(-2)}
              /
              {("0" + new Date(review.createdAt).getDate())
                .toString()
                .slice(-2)}{" "}
              {("0" + new Date(review.createdAt).getHours()).slice(-2)}:
              {("0" + new Date(review.createdAt).getMinutes()).slice(-2)}
            </span>
            <span className={styles["footer__author"]}>
              {review.displayName}
            </span>
            {(userObj.uid === review.creatorId ||
              userObj.uid === "oieGlxRf5zXW1JzXxpiY1DAskDF3") && (
              <span className={styles["creator-btn-wrapper"]}>
                <Button
                  text="수정"
                  onClick={(e) => {
                    onEditClick(e, review);
                  }}
                  className={["Review__edit"]}
                ></Button>
                <Button
                  text="삭제"
                  onClick={(e) => {
                    onDeleteClick(e, review);
                  }}
                  className={["Review__delete"]}
                ></Button>
              </span>
            )}
          </div>
        </>
      )}
    </li>
  );
};

export default Review;
