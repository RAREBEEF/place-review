import classNames from "classnames";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import {
  getMapStateType,
  loginProcessStateType,
  WriteReviewPropType,
  reviewObjType,
  reviewStateType,
  stateType,
} from "../types";
import { v4 as uuidv4 } from "uuid";
import { dbService, storageService } from "../fbase";
import { doc, setDoc } from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";
import styles from "./WriteReview.module.scss";
import Button from "./Button";
import { Link, useNavigate } from "react-router-dom";

const WriteReview: React.FC<WriteReviewPropType> = ({
  searchResult,
  selected,
  isEditMod,
  setIsEditMod,
  prevReview,
  i,
}): ReactElement => {
  const navigation = useNavigate();
  const {
    data: { geocoder },
    markerPos: location,
  } = useSelector((state: stateType): getMapStateType => state.getMap);
  const { userObj } = useSelector(
    (state: stateType): loginProcessStateType => state.loginProcess
  );
  const [review, setReview] = useState<reviewStateType>({
    title: prevReview
      ? prevReview.title
      : searchResult &&
        selected &&
        searchResult.length !== 0 &&
        selected.section === "place" &&
        searchResult[selected.index].place_name
      ? searchResult[selected.index].place_name
      : "",
    rating: prevReview ? prevReview.rating : 5,
    memo: prevReview ? prevReview.memo : "",
    location: prevReview ? { ...prevReview.location } : { ...location },
    address: prevReview ? { ...prevReview.address } : {},
  });
  const [attachment, setAttachment] = useState<string>("");
  const attachmentInputRef = useRef<any>();
  const [uploading, setUploading] = useState<boolean>(false);

  // 선택 장소가 바뀌면 자동으로 제목 변경
  // 수정모드일 경우 기존 리뷰 이름으로 고정
  // 수정모드일 경우 기존 리뷰에서 첨부사진 불러옴(기존 리뷰 사진 유무 구분용)
  useEffect((): void => {
    if (prevReview) {
      setAttachment(prevReview.attachmentUrl);
      return;
    }

    if (
      searchResult &&
      selected &&
      searchResult.length !== 0 &&
      selected.section === "place" &&
      searchResult[selected.index].place_name
    ) {
      setReview(
        (prev: reviewStateType): reviewStateType => ({
          ...prev,
          title: searchResult[selected.index].place_name,
        })
      );
    }
  }, [prevReview, searchResult, selected]);

  // 좌표를 주소로 변환하여 저장
  // 수정모드일 경우 실행 안함
  useEffect((): void => {
    if (!location || prevReview) {
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
  }, [geocoder, location, prevReview]);

  // 리뷰 제목 입력
  const onTitleChange = useCallback((e): void => {
    setReview(
      (prev: reviewStateType): reviewStateType => ({
        ...prev,
        title: e.target.value,
      })
    );
  }, []);

  // 리뷰 메모 입력
  const onMemoChange = useCallback((e): void => {
    setReview(
      (prev: reviewStateType): reviewStateType => ({
        ...prev,
        memo: e.target.value,
      })
    );
  }, []);

  // 첨부파일 선택
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

  // 첨부파일 삭제
  const onClearAttachmentClick = (): void => {
    setAttachment("");
    attachmentInputRef.current.value = null;
  };

  // 리뷰 등록
  const onSubmit = async (e: any): Promise<void> => {
    e.preventDefault();

    // 중복 업로드 방지하기 위해 업로드 중 버튼 클릭 비활성화
    setUploading(true);

    // 마커가 없을 경우
    if (Object.keys(review.location).length === 0) {
      window.alert(
        "위치 정보가 존재하지 않습니다. 지도에 마커를 설정해 주세요."
      );
      setUploading(false);
      return;
    }

    let attachmentUrl = "";
    let attachmentId = "";

    // 첨부파일 있을 경우 스토리지 업로드 후 data url로 변환하여 불러옴
    // 수정모드면서 첨부파일에 변동 없을 경우 생략
    if (prevReview && prevReview.attachmentUrl === attachment) {
      attachmentId = prevReview.attachmentId;
      attachmentUrl = prevReview.attachmentUrl;
    } else if (attachment !== "") {
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

    // 모든 내용 취합 후 데이터베이스 업로드
    if (isEditMod && prevReview && prevReview.id && setIsEditMod) {
      let reviewObj: reviewObjType = {
        ...review,
        createdAt: Date.now(),
        creatorId: prevReview.creatorId,
        displayName: prevReview.displayName,
        attachmentUrl,
        attachmentId,
      };

      await setDoc(doc(dbService, "reviews", prevReview.id), {
        ...reviewObj,
      }).catch((error): void => {
        throw error;
      });

      // 수정 모드에서 첨부파일이 변경된 경우 스토리지에서 기존 사진 찾아서 삭제
      if (
        prevReview.attachmentUrl !== "" &&
        prevReview.attachmentUrl !== attachmentUrl
      ) {
        const attachmentRef = ref(
          storageService,
          `${userObj.uid}/${prevReview.attachmentId}`
        );
        await deleteObject(attachmentRef);
      }

      setIsEditMod(false);
    } else {
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
    }

    setUploading(false);
    if (!isEditMod) {
      navigation("/");
    }
  };

  // 작성 취소
  const onCancelClick = useCallback(
    (e): void => {
      if (!isEditMod || setIsEditMod === undefined) {
        return;
      }
      e.preventDefault();

      setIsEditMod(false);
    },
    [isEditMod, setIsEditMod]
  );

  return (
    <div
      className={classNames(
        styles.container,
        isEditMod && styles["edit-mod"],
        selected?.section === "review" &&
          selected?.index === i &&
          styles.selected
      )}
    >
      <form onSubmit={onSubmit} className={styles.form}>
        <div className={styles["header-wrapper"]}>
          <label className={styles.label} htmlFor="memo">
            상호명
          </label>
          <span
            className={classNames(
              styles.counter,
              (review.title.length >= 20 || review.title.length === 0) &&
                styles.over
            )}
          >
            {review.title.length} / 20
          </span>
        </div>
        <input
          maxLength={20}
          minLength={1}
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
            {/* <div className={styles.label}>사진 첨부</div> */}
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
                사진 첨부
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
            <Button
              text="돌아가기"
              className={["NewReview__cancel"]}
              onClick={onCancelClick}
            />
          </Link>
        </div>
      </form>
      {!isEditMod && (
        <footer className={styles.footer}>
          &copy; {new Date().getFullYear()}. RAREBEEF All Rights Reserved.
        </footer>
      )}
    </div>
  );
};

export default WriteReview;
