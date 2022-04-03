import classNames from "classnames";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  getMapStateType,
  loginProcessStateType,
  NewReviewPropType,
  reviewObjType,
  reviewStateType,
  stateType,
} from "../types";
import { v4 as uuidv4 } from "uuid";
import { dbService, storageService } from "../fbase";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import styles from "./NewReview.module.scss";
import Button from "./Button";
import { Link, useNavigate } from "react-router-dom";

const NewReview: React.FC<NewReviewPropType> = (): ReactElement => {
  const navigation = useNavigate();
  const {
    data: { geocoder },
    markerPos: location,
  } = useSelector((state: stateType): getMapStateType => state.getMap);
  const { userObj } = useSelector(
    (state: stateType): loginProcessStateType => state.loginProcess
  );
  const [review, setReview] = useState<reviewStateType>({
    title: "",
    rating: 5,
    memo: "",
    location: { ...location },
    address: {},
  });
  const [attachment, setAttachment] = useState<string>("");
  const attachmentInputRef = useRef<any>();
  const [uploading, setUploading] = useState<boolean>(false);

  useEffect((): void => {
    if (!location) {
      return;
    }

    geocoder.coord2Address(
      location.getLng(),
      location.getLat(),
      (result: Array<any>, status: string) => {
        if (status === window.kakao.maps.services.Status.OK) {
          setReview(
            (prev: reviewStateType): reviewStateType => ({
              ...prev,
              location: { ...location },
              address: {
                address: result[0].address.address_name,
                roadAddress: !result[0].road_address
                  ? ""
                  : result[0].road_address.address_name,
              },
            })
          );
        } else {
          setReview(
            (prev: reviewStateType): reviewStateType => ({
              ...prev,
              location: { ...location },
              address: {
                address: "",
                roadAddress: "",
              },
            })
          );
        }
      }
    );
  }, [geocoder, location]);

  const onTitleChange = useCallback((e): void => {
    setReview(
      (prev: reviewStateType): reviewStateType => ({
        ...prev,
        title: e.target.value,
      })
    );
  }, []);

  const onMemoChange = useCallback((e): void => {
    setReview(
      (prev: reviewStateType): reviewStateType => ({
        ...prev,
        memo: e.target.value,
      })
    );
  }, []);

  const onFileChange = (e: any): void => {
    const {
      target: { files },
    } = e;
    const file = files[0];
    const reader = new FileReader();

    reader.onloadend = (e: any): void => {
      const {
        currentTarget: { result },
      } = e;
      setAttachment(result);
    };

    reader.readAsDataURL(file);
  };

  const onClearAttachmentClick = (): void => {
    setAttachment("");
    attachmentInputRef.current.value = null;
  };

  const onSubmit = async (e: any): Promise<void> => {
    e.preventDefault();

    setUploading(true);

    if (review.title === "" || (review.memo === "" && attachment === "")) {
      setUploading(false);
      return;
    }

    let attachmentUrl = "";
    let attachmentId = "";

    if (attachment !== "") {
      try {
        attachmentId = uuidv4();

        const attachmentRef = ref(
          storageService,
          `${userObj.uid}/${attachmentId}`
        );

        await uploadString(attachmentRef, attachment, "data_url");

        attachmentUrl = await getDownloadURL(
          ref(storageService, `${userObj.uid}/${attachmentId}`)
        );
      } catch (error) {
        throw error;
      }
    }

    let reviewObj: reviewObjType = {
      ...review,
      createdAt: Date.now(),
      creatorId: userObj.uid,
      displayName: userObj.displayName,
      attachmentUrl,
      attachmentId,
    };

    await setDoc(doc(dbService, "reviews", uuidv4()), { ...reviewObj }).catch(
      (error): void => {
        throw error;
      }
    );

    setUploading(false);
    navigation("/");
  };

  return (
    <form className={styles.container} onSubmit={onSubmit}>
      <div className={styles["header-wrapper"]}>
        <label className={styles.label} htmlFor="memo">
          상호명
        </label>
        <span
          className={classNames(
            styles.counter,
            review.title.length >= 20 && styles.over
          )}
        >
          {review.title.length} / 20
        </span>
      </div>
      <input
        maxLength={20}
        className={styles["input--store-name"]}
        id="storeName"
        value={review.title}
        onChange={onTitleChange}
      ></input>
      <div className={styles["middle-wrapper"]}>
        <div className={styles["rating-wrapper"]}>
          <label className={styles.label} htmlFor="rating">
            별점
          </label>
          <div className={styles["rating"]}>
            <span
              className="fa fa-star"
              style={{
                color: review.rating >= 1 ? "#eb5e28" : "lightgray",
                cursor: "pointer",
              }}
              onClick={() => {
                setReview(
                  (prev: reviewStateType): reviewStateType => ({
                    ...prev,
                    rating: 1,
                  })
                );
              }}
            ></span>
            <span
              className="fa fa-star"
              style={{
                color: review.rating >= 2 ? "#eb5e28" : "lightgray",
                cursor: "pointer",
              }}
              onClick={() => {
                setReview(
                  (prev: reviewStateType): reviewStateType => ({
                    ...prev,
                    rating: 2,
                  })
                );
              }}
            ></span>
            <span
              className="fa fa-star"
              style={{
                color: review.rating >= 3 ? "#eb5e28" : "lightgray",
                cursor: "pointer",
              }}
              onClick={() => {
                setReview(
                  (prev: reviewStateType): reviewStateType => ({
                    ...prev,
                    rating: 3,
                  })
                );
              }}
            ></span>
            <span
              className="fa fa-star"
              style={{
                color: review.rating >= 4 ? "#eb5e28" : "lightgray",
                cursor: "pointer",
              }}
              onClick={() => {
                setReview(
                  (prev: reviewStateType): reviewStateType => ({
                    ...prev,
                    rating: 4,
                  })
                );
              }}
            ></span>
            <span
              className="fa fa-star"
              style={{
                color: review.rating === 5 ? "#eb5e28" : "lightgray",
                cursor: "pointer",
              }}
              onClick={() => {
                setReview(
                  (prev: reviewStateType): reviewStateType => ({
                    ...prev,
                    rating: 5,
                  })
                );
              }}
            ></span>
          </div>
        </div>

        <div className={styles["attachment-wrapper"]}>
          <div className={styles.label}>사진 첨부</div>
          <input
            id="attachmentInput"
            onChange={onFileChange}
            type="file"
            accept="image/*"
            ref={attachmentInputRef}
            style={{ display: "none" }}
          />
          {attachment ? (
            <Button
              text="사진 삭제"
              onClick={onClearAttachmentClick}
              className={["NewReview__delete"]}
            ></Button>
          ) : (
            <label
              htmlFor="attachmentInput"
              className={classNames(styles["input--file"])}
            >
              찾아보기
            </label>
          )}
        </div>
      </div>
      <div className={styles["header-wrapper"]}>
        <label className={styles.label} htmlFor="memo">
          메모
        </label>
        <span
          className={classNames(
            styles.counter,
            review.memo.length >= 120 && styles.over
          )}
        >
          {" "}
          {review.memo.length} / 120
        </span>
      </div>
      <textarea
        maxLength={120}
        id="memo"
        className={styles["input--memo"]}
        value={review.memo}
        onChange={onMemoChange}
      ></textarea>
      <div className={styles["btn-wrapper"]}>
        <Button
          text="등록"
          className={["NewReview__submit", uploading && "disable"]}
        />
        <Link to="/">
          <Button text="돌아가기" className={["NewReview__cancel"]} />
        </Link>
      </div>
      <footer className={styles.footer}>
        &copy; {new Date().getFullYear()}. RAREBEEF All Rights Reserved.
      </footer>
    </form>
  );
};

export default NewReview;
