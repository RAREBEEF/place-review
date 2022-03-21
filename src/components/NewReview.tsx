import classNames from "classnames";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { stateType } from "../types";
import { v4 as uuidv4 } from "uuid";
import { dbService } from "../fbase";
import { doc, setDoc } from "firebase/firestore";
import styles from "./NewReview.module.scss";

const NewReview: React.FC = (): ReactElement => {
  const location = useSelector((state: stateType) => state.getMap.markerPos);
  const userObj = useSelector((state: stateType) => state.loginProcess.userObj);
  const [review, setReview] = useState({
    title: "",
    rating: 0,
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

    // 이미지 있을 경우
    // if (attachment !== "") {
    //   const attachmentRef = storageService.
    //     .ref()
    //     .child(`${userObj.uid}/${uuidv4()}`);

    //   const response = await attachmentRef.putString(attachment, "data_url");

    //   attachmentUrl = await response.ref.getDownloadURL();
    // }

    // 업로드 할 데이터
    const reviewObj = {
      ...review,
      createdAt: Date.now(),
      creatorId: userObj.uid,
      displayName: userObj.displayName,
      attachmentUrl,
    };

    await setDoc(doc(dbService, "reviews", uuidv4()), { ...reviewObj });
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
      <input
        id="rating"
        type="number"
        value={review.rating}
        onChange={onRatingChange}
      ></input>
      <input
        id="attachmentInput"
        onChange={onFileChange}
        type="file"
        accept="image/*"
        ref={attachmentInputRef}
        style={{ display: "none" }}
      />
      {attachment ? (
        <button
          onClick={onClearAttachmentClick}
          className={classNames(styles["btn--delete"], styles.btn)}
        >
          DELETE
        </button>
      ) : (
        <label
          htmlFor="attachmentInput"
          className={classNames(styles["input--file"], styles.btn)}
        >
          PHOTO
        </label>
      )}
      <label htmlFor="memo">메모</label>
      <input
        id="memo"
        type="text"
        value={review.memo}
        onChange={onMemoChange}
      ></input>
      <input type="submit" />
    </form>
  );
};

export default NewReview;
