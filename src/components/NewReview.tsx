import classNames from "classnames";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { NewReviewPropType, stateType } from "../types";
import { v4 as uuidv4 } from "uuid";
import { dbService, storageService } from "../fbase";
import { doc, setDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadString } from "firebase/storage";
import styles from "./NewReview.module.scss";
import Button from "./Button";
import { Link, useNavigate } from "react-router-dom";

const NewReview: React.FC<NewReviewPropType> = ({
  setIsFindTab,
}): ReactElement => {
  const navigation = useNavigate();
  const location = useSelector((state: stateType) => state.getMap.markerPos);
  const userObj = useSelector((state: stateType) => state.loginProcess.userObj);
  const [review, setReview] = useState({
    title: "",
    rating: 5,
    memo: "",
    location: { ...location },
  });
  const [attachment, setAttachment] = useState("");
  const attachmentInputRef = useRef<any>();

  useEffect(() => {
    setReview((prev) => ({
      ...prev,
      location: { ...location },
    }));
  }, [location]);

  const onTitleChange = useCallback((e) => {
    setReview((prev) => ({
      ...prev,
      title: e.target.value,
    }));
  }, []);

  const onRatingChange = useCallback((e) => {
    setReview((prev) => ({
      ...prev,
      rating: e.target.value,
    }));
  }, []);

  const onMemoChange = useCallback((e) => {
    setReview((prev) => ({
      ...prev,
      memo: e.target.value,
    }));
  }, []);

  // 첨부 이미지 읽기
  const onFileChange = (e: any) => {
    const {
      target: { files },
    } = e;

    const file = files[0];

    const reader = new FileReader();

    reader.onloadend = (e: any) => {
      const {
        currentTarget: { result },
      } = e;
      setAttachment(result);
    };

    reader.readAsDataURL(file);
  };

  // 첨부파일 삭제
  const onClearAttachmentClick = () => {
    setAttachment("");
    attachmentInputRef.current.value = null;
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();

    // 작성 내용 없을 경우 return
    if (review.title === "" || review.memo === "") {
      return;
    }

    let attachmentUrl = "";
    let attachmentId = "";
    // 이미지 있을 경우
    if (attachment !== "") {
      attachmentId = uuidv4();
      const attachmentRef = ref(
        storageService,
        `${userObj.uid}/${attachmentId}`
      );
      const response = await uploadString(
        attachmentRef,
        attachment,
        "data_url"
      );
      console.log(response);
      attachmentUrl = await getDownloadURL(
        ref(storageService, `${userObj.uid}/${attachmentId}`)
      );
    }

    // 업로드 할 데이터
    const reviewObj = {
      ...review,
      createdAt: Date.now(),
      creatorId: userObj.uid,
      displayName: userObj.displayName,
      attachmentUrl,
      attachmentId,
    };

    await setDoc(doc(dbService, "reviews", uuidv4()), { ...reviewObj });

    navigation("/");
  };

  return (
    <form className={styles.container} onSubmit={onSubmit}>
      <label htmlFor="storeName">상호명</label>
      <input
        id="storeName"
        value={review.title}
        onChange={onTitleChange}
      ></input>
      <label htmlFor="rating">별점</label>
      {/* <input
        id="rating"
        type="number"
        value={review.rating}
        onChange={onRatingChange}
      ></input> */}
      <div className={styles["rating"]}>
        <span
          className="fa fa-star"
          style={{
            color: review.rating >= 1 ? "orange" : "gray",
            cursor: "pointer",
          }}
          onClick={() => {
            setReview((prev) => ({
              ...prev,
              rating: 1,
            }));
          }}
        ></span>
        <span
          className="fa fa-star"
          style={{
            color: review.rating >= 2 ? "orange" : "gray",
            cursor: "pointer",
          }}
          onClick={() => {
            setReview((prev) => ({
              ...prev,
              rating: 2,
            }));
          }}
        ></span>
        <span
          className="fa fa-star"
          style={{
            color: review.rating >= 3 ? "orange" : "gray",
            cursor: "pointer",
          }}
          onClick={() => {
            setReview((prev) => ({
              ...prev,
              rating: 3,
            }));
          }}
        ></span>
        <span
          className="fa fa-star"
          style={{
            color: review.rating >= 4 ? "orange" : "gray",
            cursor: "pointer",
          }}
          onClick={() => {
            setReview((prev) => ({
              ...prev,
              rating: 4,
            }));
          }}
        ></span>
        <span
          className="fa fa-star"
          style={{
            color: review.rating === 5 ? "orange" : "gray",
            cursor: "pointer",
          }}
          onClick={() => {
            setReview((prev) => ({
              ...prev,
              rating: 5,
            }));
          }}
        ></span>
      </div>
      <div className={styles["attachment-wrapper"]}>
        <input
          id="attachmentInput"
          onChange={onFileChange}
          type="file"
          accept="image/*"
          ref={attachmentInputRef}
          style={{ display: "none" }}
        />
        {attachment && (
          <img
            className={styles["photo-preview"]}
            src={attachment}
            alt={attachment}
          />
        )}
        {attachment ? (
          <Button text="DELETE" onClick={onClearAttachmentClick}></Button>
        ) : (
          <label
            htmlFor="attachmentInput"
            className={classNames(styles["input--file"], styles.btn)}
          >
            PHOTO
          </label>
        )}
      </div>
      <label htmlFor="memo">메모</label>
      <input
        id="memo"
        className={styles["input--memo"]}
        type="text"
        value={review.memo}
        onChange={onMemoChange}
      ></input>
      <div className={styles["btn-wrapper"]}>
        <input type="submit" />
        <Link to="/">
          <Button
            onClick={() => {
              setIsFindTab(true);
            }}
            text="돌아가기"
          />
        </Link>
      </div>
    </form>
  );
};

export default NewReview;
